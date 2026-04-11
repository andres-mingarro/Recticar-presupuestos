import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recticar Presupuestos",
  description:
    "Gestión de presupuestos y seguimiento de clientes para rectificadora de motores.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body className="min-h-full">
        <div className="relative min-h-screen overflow-hidden bg-[var(--color-background)] text-[var(--color-foreground)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_35%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.16),transparent_40%)]" />
          {children}
        </div>
      </body>
    </html>
  );
}
