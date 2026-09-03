import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/link-button";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-mono text-sm text-brass">404</p>
      <h1 className="mt-3 font-display text-2xl font-semibold sm:text-3xl">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-2 max-w-sm text-sm text-fg/60">
        Tool yang kamu cari mungkin sudah pindah atau belum ada.
      </p>
      <LinkButton href="/" className="mt-6">
        Kembali ke beranda
      </LinkButton>
    </Container>
  );
}
