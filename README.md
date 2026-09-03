# ArulKit

All-in-One Tools dengan personal branding — dibuat dan dirawat oleh **Arul**.
Domain target: **arulkit.my.id**

Tiga tools utama:
1. **Catbox Upload** — upload file (drag & drop / file picker) ke Catbox.moe, dapat link permanen.
2. **All-in-One Downloader** — download video/audio dari YouTube, Instagram, TikTok, dengan auto-detect platform.
3. **View Source** — lihat HTML mentah sebuah website dari server, dengan syntax highlighting, dilindungi dari SSRF.

Plus live chat **Tawk.to** global untuk feedback, bug report, dan request fitur, serta section **Suggest a Tool** di homepage.

---

## Tech stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** (custom design tokens — dark mode by default, light mode tersedia)
- **Framer Motion** untuk micro-interaction di hero
- **react-syntax-highlighter** (Prism) untuk View Source
- **next-themes** untuk toggle dark/light
- **lucide-react** untuk ikon

---

## Struktur folder

```
app/
  layout.tsx              # root layout: fonts, metadata, ThemeProvider, Navbar/Footer, Tawk.to
  page.tsx                # homepage — merangkai semua section
  globals.css             # CSS variables untuk tema (light/dark)
  sitemap.ts               # sitemap.xml dinamis, dari registry tools
  robots.ts                # robots.txt dinamis
  not-found.tsx
  tools/
    catbox-upload/page.tsx
    downloader/page.tsx
    view-source/page.tsx
  api/
    catbox/route.ts        # proxy upload ke Catbox (server-side, agar userhash tidak bocor)
    downloader/route.ts     # resolve link YouTube/Instagram/TikTok
    view-source/route.ts    # fetch HTML server-side dengan proteksi SSRF

components/
  layout/                  # Navbar, Footer, ThemeToggle
  home/                    # Hero, SearchTools (search+kategori+grid), PopularTools,
                           # RecentlyAdded, SuggestTool, ToolCard
  tools/                   # CatboxUploader, DownloaderForm, ViewSourceViewer, ToolPageHeader
  ui/                      # Button, LinkButton, Badge, Spinner, CopyButton, Container
  providers/               # ThemeProvider, TawkTo (script loader)

lib/
  config/
    site.ts                # metadata situs
    tools.ts                # REGISTRY tool — satu sumber kebenaran untuk homepage & sitemap
  downloader/
    types.ts                # interface DownloaderProvider + DownloadResult (abstraction layer)
    detect-platform.ts       # deteksi platform dari URL
    index.ts                 # resolver: pilih provider yang tepat, dengan fallback
    providers/
      SocialKit.ts               # provider utama (self-hosted, lihat bagian API di bawah)
      tikwm.ts                 # fallback gratis khusus TikTok, tanpa perlu setup
  security/
    ssrf.ts                  # validasi URL, blokir IP privat/internal, dipakai View Source
  tawkto.ts                  # helper buka chat Tawk.to dari mana saja (dipakai Suggest a Tool)
  utils.ts

public/                     # favicon.svg, og-image.svg
```

**Kenapa struktur ini:** setiap tool punya API-route + komponen UI sendiri (mudah discale — tambah
tool baru = tambah 1 folder di `app/tools/`, 1 route di `app/api/`, 1 entry di `lib/config/tools.ts`),
sementara logika yang bisa dipakai ulang (deteksi platform, provider downloader, proteksi SSRF)
dipisah ke `lib/` supaya tidak terikat ke satu halaman. `lib/downloader/` sengaja dibuat sebagai
**abstraction layer** (interface `DownloaderProvider`) bukan cuma satu file fetch — karena tidak ada
API downloader all-in-one yang resmi & gratis (lihat bagian riset API di bawah), jadi provider-nya
harus bisa diganti/ditambah tanpa menyentuh UI atau route.

---

## Setup lokal

```bash
npm install
cp .env.example .env.local   # isi sesuai kebutuhan, lihat tabel di bawah
npm run dev
```

Buka `http://localhost:3000`.

```bash
npm run build   # production build
npm run start   # jalankan hasil build
npm run lint     # ESLint (next/core-web-vitals)
npm run typecheck
```

---

## Riset API/Provider — keputusan & alasan

Sesuai instruksi project: **tidak ada API yang di-hardcode secara ilegal**, semua lewat env var,
dan kalau tidak ada API layak → dibuat abstraction layer, bukan API palsu.

### 1. Catbox Upload → API resmi Catbox

- Endpoint: `POST https://catbox.moe/user/api.php`, `reqtype=fileupload`, field `fileToUpload`.
- **Tidak butuh API key** untuk upload anonim. `userhash` (dari akun Catbox, opsional) hanya
  diperlukan kalau kamu mau file-nya tersambung ke akunmu (supaya bisa dikelola/dihapus nanti).
- Dokumentasi: https://catbox.moe/tools.php
- Batas resmi: 200MB per file — sudah divalidasi di `app/api/catbox/route.ts`.
- **Gratis, tidak butuh pembayaran.**

### 2. All-in-One Downloader → SocialKit (self-hosted) + tikwm (fallback TikTok)

Tidak ada API YouTube/Instagram/TikTok gabungan yang **resmi, gratis, dan legal** untuk pihak
ketiga:
- API resmi YouTube (Data API v3) **tidak menyediakan** download video (melanggar ToS kalau dipaksakan).
- Instance publik `api.SocialKit.tools` **tidak untuk dipakai aplikasi pihak ketiga** — pemiliknya
  eksplisit meminta integrator untuk **self-host** instance sendiri (lihat
  https://github.com/imputnet/SocialKit/blob/main/docs/api.md).

Karena itu ArulKit memakai pola **provider interface** (`lib/downloader/types.ts` →
`DownloaderProvider`):

| Provider | Platform | Butuh setup? | Catatan |
|---|---|---|---|
| **SocialKit** (`lib/downloader/providers/SocialKit.ts`) | YouTube, Instagram, TikTok | Ya — deploy instance sendiri | Open-source (AGPL-3.0), https://github.com/imputnet/SocialKit. Bisa deploy gratis lewat Railway/Fly.io/VPS sendiri, atau Docker. Set `SOCIALKIT_API_KEY` ke base URL instance-mu. |
| **tikwm** (`lib/downloader/providers/tikwm.ts`) | TikTok saja | Tidak — jalan langsung | API publik gratis tanpa key (https://www.tikwm.com), dipakai sebagai fallback zero-config supaya TikTok tetap jalan sebelum kamu setup SocialKit. Unofficial & rate-limited (~1 req/detik), bisa berubah sewaktu-waktu. |

**Kalau `SOCIALKIT_API_KEY` belum diisi:** TikTok tetap berfungsi lewat tikwm, tapi YouTube & Instagram
akan menampilkan pesan "belum dikonfigurasi" (HTTP 501) — bukan error palsu atau data bohongan.

**Biaya:** SocialKit sendiri gratis (open-source), tapi kamu perlu **hosting** untuk instance-nya.
Opsi gratis/murah: Railway (free trial/hobby tier terbatas), Fly.io (free allowance terbatas), atau
VPS murah (~$3–5/bulan). Tidak ada biaya API key karena SocialKit tidak butuh API key kecuali kamu
mengaktifkan `API_AUTH_REQUIRED` di instance-mu sendiri (lalu isi `SOCIALKIT_API_KEY` di ArulKit).

**Kepatuhan:** downloader ini hanya alat teknis untuk mengambil media dari link yang kamu masukkan
sendiri — pastikan dipakai untuk konten yang memang kamu punya hak/izin (koleksi pribadi, konten
sendiri, atau konten berlisensi bebas), bukan untuk membajak karya orang lain.

### 3. View Source → tanpa API eksternal

Fetch dilakukan langsung dari server Next.js (`app/api/view-source/route.ts`), tidak butuh API
pihak ketiga. Proteksi yang diimplementasikan di `lib/security/ssrf.ts`:

- Validasi skema URL (`http:`/`https:` saja), tolak URL dengan kredensial (`user:pass@`).
- Blok hostname internal (`localhost`, metadata endpoint cloud, dst).
- **Resolve DNS lalu validasi setiap IP hasilnya** — menolak `10.0.0.0/8`, `127.0.0.0/8`,
  `169.254.0.0/16` (termasuk `169.254.169.254` — endpoint metadata cloud), `172.16.0.0/12`,
  `192.168.0.0/16`, `100.64.0.0/10` (CGNAT), dan rentang IPv6 setara (loopback, link-local, ULA).
- Redirect **tidak diikuti otomatis** — setiap hop redirect divalidasi ulang dengan aturan yang
  sama (maks. 3 hop), supaya tidak bisa dipakai untuk melompat ke alamat internal.
- **Timeout** (`VIEW_SOURCE_TIMEOUT_MS`, default 8 detik) dan **batas ukuran response**
  (`VIEW_SOURCE_MAX_BYTES`, default ~2MB) — response di-stream dan langsung dipotong begitu
  melebihi batas, tidak mengandalkan header `Content-Length` yang bisa saja salah/bohong.
- HTML yang diambil **hanya ditampilkan sebagai teks** (lewat syntax highlighter), tidak pernah
  di-render sebagai DOM atau dieksekusi sebagai script.

> **Keterbatasan yang perlu diketahui:** validasi IP dilakukan sesaat sebelum fetch (bukan
> IP-pinning penuh), jadi secara teori masih ada celah *DNS-rebinding* yang sangat sempit (domain
> mengubah DNS-nya tepat di antara validasi dan fetch). Untuk kebutuhan yang lebih kritikal,
> pertimbangkan menjalankan fetch lewat egress proxy/allowlist di level infrastruktur.

---

## Environment Variables

Lihat `.env.example` untuk daftar lengkap beserta komentarnya. Ringkasan:

| Variable | Wajib? | Keterangan |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Disarankan | Dipakai untuk metadata, sitemap, robots.txt |
| `CATBOX_USERHASH` | Opsional | Supaya upload tersambung ke akun Catbox-mu |
| `SOCIALKIT_API_KEY` | Opsional* | *Wajib kalau mau downloader YouTube/Instagram jalan | 
| `SOCIALKIT_API_KEY` | Opsional | Hanya kalau instance SocialKit-mu pakai auth |
| `VIEW_SOURCE_TIMEOUT_MS` | Opsional | Default 8000 |
| `VIEW_SOURCE_MAX_BYTES` | Opsional | Default 2000000 (~2MB) |
| `NEXT_PUBLIC_TAWKTO_PROPERTY_ID` | Opsional | Widget Tawk.to tidak muncul kalau kosong |
| `NEXT_PUBLIC_TAWKTO_WIDGET_ID` | Opsional | Default `"default"` |

**Jangan commit `.env.local`** — sudah masuk `.gitignore`.

---

## Deploy ke Vercel

1. Push repo ini ke GitHub.
2. Import project di [vercel.com/new](https://vercel.com/new) — Vercel otomatis mendeteksi Next.js.
3. Di **Project Settings → Environment Variables**, isi variabel dari tabel di atas (minimal
   `NEXT_PUBLIC_SITE_URL`; isi `SOCIALKIT_API_KEY` kalau instance SocialKit-mu sudah siap; isi kredensial
   Tawk.to kalau sudah bikin akun).
4. Deploy. Lalu di **Project Settings → Domains**, tambahkan `arulkit.my.id` dan arahkan DNS
   (CNAME/A record) sesuai instruksi Vercel.
5. `vercel.json` di repo ini sudah menyiapkan `framework: "nextjs"` dan header keamanan dasar.

---

## Keterbatasan yang diketahui (known limitations)

- **Ukuran upload Catbox lewat proxy server**: karena upload diproxy lewat Next.js API route (biar
  `CATBOX_USERHASH` tidak bocor ke client), ukuran file efektif dibatasi oleh limit body Vercel
  Serverless Function (± 4.5MB di paket Hobby), **bukan** limit 200MB dari Catbox sendiri. Untuk
  mendukung file besar, pertimbangkan upgrade plan Vercel dengan limit lebih besar, atau ubah alur
  jadi upload langsung dari browser ke Catbox (perlu dicek dulu apakah endpoint Catbox mengizinkan
  CORS dari domain-mu).
- **OG image berformat SVG** (`public/og-image.svg`) — sebagian platform (terutama beberapa crawler
  lama) merender og:image PNG/JPG lebih konsisten daripada SVG. Disarankan generate versi PNG
  (mis. lewat `@vercel/og` atau export manual) sebelum production penuh.
- **tikwm** adalah API tidak resmi — bisa berubah struktur responnya sewaktu-waktu tanpa
  pemberitahuan. Kalau suatu saat berhenti berfungsi, arahkan TikTok juga lewat SocialKit (`SOCIALKIT_API_KEY`).
- **SocialKit** butuh instance yang kamu jalankan & rawat sendiri (bukan layanan yang otomatis selalu
  aktif) — lihat https://github.com/imputnet/SocialKit/blob/main/docs/run-an-instance.md untuk cara
  deploy (Docker / Docker Compose / one-click template).

---

## Lisensi

Kode ArulKit ini bisa kamu pakai/modifikasi bebas untuk keperluan pribadi. Pastikan tetap mengikuti
lisensi masing-masing dependency (lihat `package.json`) dan Terms of Service dari Catbox, SocialKit,
tikwm, dan Tawk.to saat dipakai di production.
