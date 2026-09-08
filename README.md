# ArulKit

ArulKit adalah kumpulan tools web sederhana untuk kebutuhan harian.

## Tools

1. **Social Media Downloader** — download media dari Instagram dan TikTok.
2. **Anime Searcher** — cari anime dari katalog Otakudesu melalui API SiputZX.
3. **View Source** — mengambil HTML sebuah website dari server dan menampilkannya sebagai teks.

## Struktur penting

```text
app/
  api/
    anime/search/route.ts
    downloader/route.ts
    downloader/proxy/route.ts
    view-source/route.ts
  tools/
    anime-searcher/page.tsx
    downloader/page.tsx
    view-source/page.tsx
components/
  tools/
    anime-searcher.tsx
    downloader-form.tsx
    tool-page-header.tsx
lib/
  config/tools.ts
  config/site.ts
  downloader/
    detect-platform.ts
    index.ts
    types.ts
    providers/
      siputzx.ts
      tikwm.ts
```

## API

Anime Searcher menggunakan endpoint:

```text
https://api.siputzx.my.id/api/anime/otakudesu/search?s={query}
```

Downloader Instagram menggunakan provider SiputZX. TikTok menggunakan TikWM. URL media Instagram yang bersifat sementara di-resolve ulang ketika tombol download dibuka supaya tidak memakai signed URL yang sudah kedaluwarsa.

## Setup lokal

```bash
npm install
npm run dev
```

Untuk production:

```bash
npm run build
npm run start
```

## Environment

`NEXT_PUBLIC_SITE_URL` dapat digunakan untuk menentukan URL canonical situs. Tool downloader saat ini tidak membutuhkan `SOCIALKIT_API_KEY`.

## Catatan penggunaan

Gunakan downloader hanya untuk media yang memang kamu punya hak atau izin untuk mengunduhnya. Link hasil Anime Searcher mengarah ke halaman sumber.
