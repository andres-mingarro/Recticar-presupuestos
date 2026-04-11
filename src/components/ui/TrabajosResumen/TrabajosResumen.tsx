"use client";

import { useMemo } from "react";
import type { TrabajoAgrupado } from "@/lib/types";
import { useTrabajosSeleccion } from "@/components/forms/PedidoForm/TrabajosSeleccionContext";
import { formatPrice } from "@/lib/format";

type TrabajosResumenProps = {
  trabajos: TrabajoAgrupado[];
};

export function TrabajosResumen({ trabajos }: TrabajosResumenProps) {
  const { selectedIds } = useTrabajosSeleccion();

  const selectedTrabajos = useMemo(
    () => trabajos.flatMap((g) => g.trabajos).filter((t) => selectedIds.has(t.id)),
    [trabajos, selectedIds]
  );

  const total = useMemo(
    () => selectedTrabajos.reduce((sum, t) => sum + t.precio, 0),
    [selectedTrabajos]
  );

  if (selectedTrabajos.length === 0) return null;

  return (
    <div className="space-y-1 rounded-xl bg-[var(--color-surface)] p-3 text-xs">
      {selectedTrabajos.map((t) => (
        <div key={t.id} className="flex items-baseline justify-between gap-2">
          <span className="text-[var(--color-foreground-muted)]">{t.nombre}</span>
          <span className="shrink-0 font-medium text-[var(--color-foreground)]">
            {formatPrice(t.precio)}
          </span>
        </div>
      ))}
      <div className="mt-2 flex items-baseline justify-between gap-2 border-t border-[var(--color-border)] pt-2">
        <span className="font-semibold text-[var(--color-foreground)]">Total</span>
        <span className="shrink-0 font-semibold text-[var(--color-accent)]">
          {formatPrice(total)}
        </span>
      </div>
    </div>
  );
}
