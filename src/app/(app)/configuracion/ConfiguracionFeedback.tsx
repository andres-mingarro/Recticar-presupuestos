"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function ConfiguracionFeedback({
  wasSaved,
}: {
  wasSaved: boolean;
}) {
  const lastToastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!wasSaved) return;

    const toastKey = "configuracion-empresa-saved";
    if (lastToastKeyRef.current === toastKey) return;
    lastToastKeyRef.current = toastKey;

    toast.success("Datos de la empresa guardados correctamente.");

    const url = new URL(window.location.href);
    url.searchParams.delete("saved");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, [wasSaved]);

  return null;
}
