import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recticar Presupuestos",
  description:
    "Gestión de presupuestos y seguimiento de clientes para rectificadora de motores.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full">
        <div className="relative min-h-screen overflow-hidden bg-[var(--color-background)] text-[var(--color-foreground)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_35%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.16),transparent_40%)]" />
          <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            <header className="mb-8 rounded-[28px] border border-white/60 bg-white/80 px-5 py-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <Link
                    href="/"
                    className="inline-flex items-center text-lg font-semibold tracking-tight text-[var(--color-foreground)]"
                  >
                    Recticar Presupuestos
                  </Link>
                  <p className="text-sm text-[var(--color-foreground-muted)]">
                    Presupuestos, clientes y seguimiento de trabajos.
                  </p>
                </div>
                <nav className="flex flex-wrap gap-2 text-sm">
                  <Link
                    href="/"
                    className="rounded-full px-3 py-2 text-[var(--color-foreground-muted)] transition hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-foreground)]"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/clientes"
                    className="rounded-full px-3 py-2 text-[var(--color-foreground-muted)] transition hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-foreground)]"
                  >
                    Clientes
                  </Link>
                  <Link
                    href="/pedidos"
                    className="rounded-full px-3 py-2 text-[var(--color-foreground-muted)] transition hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-foreground)]"
                  >
                    Pedidos
                  </Link>
                </nav>
              </div>
            </header>
            <main className="flex-1">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
