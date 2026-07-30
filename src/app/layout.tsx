import type { Metadata } from "next";
import { cookies } from "next/headers";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "../scss/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { MODE_COOKIE, THEME_COOKIE, resolveThemeId, resolveThemeMode } from "@/lib/themes";

export const metadata: Metadata = {
  title: "Recticar Presupuestos",
  description:
    "Gestión de presupuestos y seguimiento de clientes para rectificadora de motores.",
  robots: { index: false, follow: false },
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "any" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: "/favicon/apple-touch-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Se resuelve en el server para que no haya flash del theme por defecto.
  // Con modo "system" no se escribe `data-mode`: el CSS lo resuelve solo con
  // prefers-color-scheme, sin JS.
  const jar = await cookies();
  const theme = resolveThemeId(jar.get(THEME_COOKIE)?.value);
  const mode = resolveThemeMode(jar.get(MODE_COOKIE)?.value);

  return (
    <html
      lang="es"
      data-theme={theme}
      data-mode={mode === "system" ? undefined : mode}
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body className="min-h-full">
        <div className="relative min-h-screen bg-[var(--color-background)] text-[var(--text-color-defult)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top_left,rgb(var(--brand-400-rgb)_/_0.18),transparent_35%),radial-gradient(circle_at_top_right,rgb(var(--brand-500-rgb)_/_0.16),transparent_40%)]" />
          {children}
          <Toaster />
        </div>
      </body>
    </html>
  );
}
