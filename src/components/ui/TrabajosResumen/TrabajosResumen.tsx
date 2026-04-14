"use client";

import { useMemo } from "react";
import type { TrabajoAgrupado } from "@/lib/types";
import { useTrabajosSeleccion } from "@/components/forms/PedidoForm/TrabajosSeleccionContext";
import { formatPrice } from "@/lib/format";

type TrabajosResumenProps = {
  trabajos: TrabajoAgrupado[];
};

function getPrecio(t: TrabajoAgrupado["trabajos"][number], lista: 1 | 2 | 3) {
  if (lista === 2) return t.precioLista2;
  if (lista === 3) return t.precioLista3;
  return t.precioLista1;
}

const LISTA_COLORS: Record<1 | 2 | 3, string> = {
  1: "bg-sky-100 text-sky-700",
  2: "bg-violet-100 text-violet-700",
  3: "bg-emerald-100 text-emerald-700",
};

export function TrabajosResumen({ trabajos }: TrabajosResumenProps) {
  const { selectedIds, listaPrecios } = useTrabajosSeleccion();

  const selectedTrabajos = useMemo(
    () => trabajos.flatMap((g) => g.trabajos).filter((t) => selectedIds.has(t.id)),
    [trabajos, selectedIds]
  );

  const total = useMemo(
    () => selectedTrabajos.reduce((sum, t) => sum + getPrecio(t, listaPrecios), 0),
    [selectedTrabajos, listaPrecios]
  );

  if (selectedTrabajos.length === 0) return null;

  return (
    <div className="TrabajosResumen space-y-1 rounded-xl bg-[var(--color-surface)] p-3 text-xs">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-foreground-muted)]">Resumen</span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${LISTA_COLORS[listaPrecios]}`}>
          Lista {listaPrecios}
        </span>
      </div>
      {selectedTrabajos.map((t) => (
        <div key={t.id} className="flex items-baseline justify-between gap-2">
          <span className="text-[var(--color-foreground-muted)]">{t.nombre}</span>
          <span className="shrink-0 font-medium text-[var(--color-foreground)]">
            {formatPrice(getPrecio(t, listaPrecios))}
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
