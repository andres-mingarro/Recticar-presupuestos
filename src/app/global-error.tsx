"use client";

import { useEffect } from "react";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "../scss/globals.css";
import { ErrorState } from "@/components/feedback/ErrorState";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="es" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full bg-[var(--color-background)] text-[var(--text-color-defult)]">
        <ErrorState
          code="500"
          title="La app encontró un error crítico"
          description="Se produjo un fallo a nivel global y la pantalla actual no pudo mantenerse activa."
          hint="Reintentá una vez. Si persiste, lo más útil suele ser volver al inicio y repetir el flujo desde cero."
          actions={[
            { label: "Reintentar", onClick: reset, variant: "primary" },
            { label: "Ir al inicio", href: "/", variant: "secondary" },
          ]}
        />
      </body>
    </html>
  );
}
