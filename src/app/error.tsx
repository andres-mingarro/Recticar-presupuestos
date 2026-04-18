"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/feedback/ErrorState";

export default function Error({
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
    <ErrorState
      code="500"
      title="Hubo un problema inesperado"
      description="Algo falló mientras se cargaba esta pantalla. La aplicación sigue disponible, pero esta vista no pudo renderizarse correctamente."
      hint="Podés reintentar ahora. Si vuelve a pasar, revisamos el flujo puntual que dispara este error."
      actions={[
        { label: "Reintentar", onClick: reset, variant: "primary" },
        { label: "Volver al dashboard", href: "/", variant: "secondary" },
      ]}
    />
  );
}
