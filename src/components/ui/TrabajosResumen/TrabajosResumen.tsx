"use client";

import { useMemo } from "react";
import type { RepuestoAgrupado, TrabajoAgrupado } from "@/lib/types";
import { useTrabajosSeleccion } from "@/components/forms/PedidoForm/TrabajosSeleccionContext";
import { useRepuestosSeleccion } from "@/components/forms/PedidoForm/RepuestosSeleccionContext";
import { formatPrice } from "@/lib/format";

type TrabajosResumenProps = {
  trabajos: TrabajoAgrupado[];
  repuestos?: RepuestoAgrupado[];
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

export function TrabajosResumen({ trabajos, repuestos = [] }: TrabajosResumenProps) {
  const { selectedIds, listaPrecios } = useTrabajosSeleccion();
  const { selectedItems: selectedRepuestoItems } = useRepuestosSeleccion();

  const selectedTrabajos = useMemo(
    () => trabajos.flatMap((g) => g.trabajos).filter((t) => selectedIds.has(t.id)),
    [trabajos, selectedIds]
  );

  const selectedRepuestos = useMemo(
    () =>
      Object.entries(selectedRepuestoItems).map(([id, item]) => {
        const repuesto = repuestos
          .flatMap((g) => g.repuestos)
          .find((current) => current.id === Number(id));

        return {
          id: Number(id),
          nombre: repuesto?.nombre ?? "Repuesto",
          cantidad: item.cantidad,
          total: item.precioUnitario * item.cantidad,
        };
      }),
    [repuestos, selectedRepuestoItems]
  );

  const total = useMemo(
    () =>
      selectedTrabajos.reduce((sum, t) => sum + getPrecio(t, listaPrecios), 0) +
      selectedRepuestos.reduce((sum, r) => sum + r.total, 0),
    [selectedTrabajos, selectedRepuestos, listaPrecios]
  );

  if (selectedTrabajos.length === 0 && selectedRepuestos.length === 0) return null;

  return (
    <div className="TrabajosResumen space-y-1 rounded-xl bg-[var(--color-surface)] p-3 text-xs">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-foreground-muted)]">Resumen</span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${LISTA_COLORS[listaPrecios]}`}>
          Lista {listaPrecios}
        </span>
      </div>
      {selectedTrabajos.length > 0 ? (
        <div className="space-y-1.5">
          <div className="pt-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-foreground-muted)]">
            Trabajos
          </div>
          {selectedTrabajos.map((t) => (
            <div key={t.id} className="flex items-baseline justify-between gap-2">
              <span className="text-[var(--color-foreground-muted)]">{t.nombre}</span>
              <span className="shrink-0 font-medium text-[var(--color-foreground)]">
                {formatPrice(getPrecio(t, listaPrecios))}
              </span>
            </div>
          ))}
        </div>
      ) : null}
      {selectedRepuestos.length > 0 ? (
        <div className="space-y-1.5">
          <div className="pt-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-foreground-muted)]">
            Repuestos
          </div>
          {selectedRepuestos.map((r) => (
            <div key={`repuesto-${r.id}`} className="flex items-baseline justify-between gap-2">
              <span className="text-[var(--color-foreground-muted)]">{r.nombre} x{r.cantidad}</span>
              <span className="shrink-0 font-medium text-[var(--color-foreground)]">
                {formatPrice(r.total)}
              </span>
            </div>
          ))}
        </div>
      ) : null}
      <div className="mt-2 flex items-baseline justify-between gap-2 border-t border-[var(--color-border)] pt-2">
        <span className="font-semibold text-[var(--color-foreground)]">Total</span>
        <span className="shrink-0 font-semibold text-[var(--color-accent)]">
          {formatPrice(total)}
        </span>
      </div>
    </div>
  );
}
