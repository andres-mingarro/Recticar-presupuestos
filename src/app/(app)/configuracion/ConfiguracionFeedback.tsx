"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function ConfiguracionFeedback({
  wasSaved,
  cleanupStatus,
  deletedCount,
}: {
  wasSaved: boolean;
  cleanupStatus?: string;
  deletedCount?: number;
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

  useEffect(() => {
    if (!cleanupStatus) return;

    const toastKey = cleanupStatus === "done"
      ? `configuracion-cleanup-done-${deletedCount ?? 0}`
      : `configuracion-cleanup-${cleanupStatus}`;
    if (lastToastKeyRef.current === toastKey) return;
    lastToastKeyRef.current = toastKey;

    if (cleanupStatus === "done") {
      toast.success(
        deletedCount && deletedCount > 0
          ? `Limpieza ejecutada: se borraron ${deletedCount} trabajos vencidos.`
          : "Limpieza ejecutada: no había trabajos vencidos para borrar."
      );
    } else if (cleanupStatus === "disabled") {
      toast.message("La limpieza automática está desactivada.");
    }

    const url = new URL(window.location.href);
    url.searchParams.delete("cleanup");
    url.searchParams.delete("deleted");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, [cleanupStatus, deletedCount]);

  return null;
}
