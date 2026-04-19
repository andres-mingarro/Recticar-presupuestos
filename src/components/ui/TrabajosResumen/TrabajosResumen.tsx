"use client";

import { useActionState, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import type { TrabajoDetalleItem } from "@/lib/queries/catalogo";
import type { RepuestoAgrupado, TrabajoAgrupado } from "@/lib/types";
import { useTrabajosSeleccion } from "@/components/forms/TrabajoForm/TrabajosSeleccionContext";
import { useRepuestosSeleccion } from "@/components/forms/TrabajoForm/RepuestosSeleccionContext";
import { Button } from "@/components/ui/Button";
import { ListPriceBadge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/format";

type TrabajosResumenProps = {
  trabajos: TrabajoAgrupado[];
  repuestos?: RepuestoAgrupado[];
  snapshotTrabajos?: TrabajoDetalleItem[];
  refreshSnapshotPricesAction?: (
    state: { error: string | null; success: boolean; updatedCount: number },
    formData: FormData
  ) => Promise<{ error: string | null; success: boolean; updatedCount: number }>;
};

function getPrecio(t: TrabajoAgrupado["trabajos"][number], lista: 1 | 2 | 3) {
  if (lista === 2) return t.precioLista2;
  if (lista === 3) return t.precioLista3;
  return t.precioLista1;
}

export function TrabajosResumen({
  trabajos,
  repuestos = [],
  snapshotTrabajos = [],
  refreshSnapshotPricesAction,
}: TrabajosResumenProps) {
  const { selectedIds, listaPrecios } = useTrabajosSeleccion();
  const { selectedItems: selectedRepuestoItems } = useRepuestosSeleccion();
  const trabajosById = useMemo(
    () => new Map(trabajos.flatMap((g) => g.trabajos).map((trabajo) => [trabajo.id, trabajo])),
    [trabajos]
  );
  const [refreshState, refreshAction, refreshPending] = useActionState(
    refreshSnapshotPricesAction ?? (async () => ({ error: "No disponible.", success: false, updatedCount: 0 })),
    { error: null as string | null, success: false, updatedCount: 0 }
  );
  const lastRefreshToastRef = useRef<string | null>(null);

  const selectedTrabajos = useMemo(
    () => {
      if (snapshotTrabajos.length === 0) {
        return trabajos.flatMap((g) => g.trabajos).filter((t) => selectedIds.has(t.id));
      }

      const snapshotSelected = snapshotTrabajos.filter((item) =>
        item.trabajoId === null || selectedIds.has(item.trabajoId)
      );
      const snapshotIds = new Set(
        snapshotSelected
          .map((item) => item.trabajoId)
          .filter((item): item is number => item !== null)
      );
      const currentOnlySelected = trabajos
        .flatMap((g) => g.trabajos)
        .filter((t) => selectedIds.has(t.id) && !snapshotIds.has(t.id));

      return [...snapshotSelected, ...currentOnlySelected];
    },
    [snapshotTrabajos, trabajos, selectedIds]
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
      selectedTrabajos.reduce((sum, t) => sum + ("precioLista1" in t ? getPrecio(t, listaPrecios) : t.precio), 0) +
      selectedRepuestos.reduce((sum, r) => sum + r.total, 0),
    [selectedTrabajos, selectedRepuestos, listaPrecios]
  );

  const snapshotDiffs = useMemo(() => {
    if (snapshotTrabajos.length === 0) return [];

    return snapshotTrabajos
      .filter((item) => item.trabajoId === null || selectedIds.has(item.trabajoId))
      .map((item) => {
        const current = item.trabajoId !== null ? trabajosById.get(item.trabajoId) : undefined;

        if (item.trabajoId === null || !current) {
          return {
            nombre: item.trabajoNombre,
            snapshotPrecio: item.precio,
            currentPrecio: null,
            missing: true,
          };
        }

        const currentPrecio = getPrecio(current, listaPrecios);
        if (currentPrecio === item.precio) {
          return null;
        }

        return {
          nombre: item.trabajoNombre,
          snapshotPrecio: item.precio,
          currentPrecio,
          missing: false,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [snapshotTrabajos, selectedIds, trabajosById, listaPrecios]);

  useEffect(() => {
    if (!refreshState.success) return;

    const toastKey = `trabajos-resumen-refresh-${refreshState.updatedCount}`;
    if (lastRefreshToastRef.current === toastKey) return;
    lastRefreshToastRef.current = toastKey;

    toast.success(
      refreshState.updatedCount === 1
        ? "Valores actualizados correctamente. Se actualizó 1 item desde el catálogo actual."
        : `Valores actualizados correctamente. Se actualizaron ${refreshState.updatedCount} items desde el catálogo actual.`
    );
  }, [refreshState.success, refreshState.updatedCount]);

  useEffect(() => {
    if (!refreshState.error) return;

    const toastKey = `trabajos-resumen-refresh-error-${refreshState.error}`;
    if (lastRefreshToastRef.current === toastKey) return;
    lastRefreshToastRef.current = toastKey;

    toast.error(refreshState.error);
  }, [refreshState.error]);

  if (selectedTrabajos.length === 0 && selectedRepuestos.length === 0) return null;

  return (
    <div className="TrabajosResumen space-y-1 rounded-xl bg-[var(--color-surface)] p-3 text-xs">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-color-gray)]">Resumen</span>
        <ListPriceBadge
          lista={listaPrecios}
          label={`Lista ${listaPrecios}`}
          className="min-w-0 px-2 py-0.5 text-[10px]"
        />
      </div>
      {selectedTrabajos.length > 0 ? (
        <div className="space-y-1.5">
          <div className="pt-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-color-gray)]">
            Trabajos
          </div>
          {selectedTrabajos.map((t) => (
            <div key={"trabajoId" in t ? (t.trabajoId ?? `${t.categoriaNombre}-${t.trabajoNombre}`) : t.id} className="flex items-baseline justify-between gap-2">
              <span className="text-[var(--text-color-gray)]">{"trabajoNombre" in t ? t.trabajoNombre : t.nombre}</span>
              <span className="shrink-0 font-medium text-[var(--text-color-defult)]">
                {formatPrice("precioLista1" in t ? getPrecio(t, listaPrecios) : t.precio)}
              </span>
            </div>
          ))}
        </div>
      ) : null}
      {selectedRepuestos.length > 0 ? (
        <div className="space-y-1.5">
          <div className="pt-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-color-gray)]">
            Repuestos
          </div>
          {selectedRepuestos.map((r) => (
            <div key={`repuesto-${r.id}`} className="flex items-baseline justify-between gap-2">
              <span className="text-[var(--text-color-gray)]">{r.nombre} x{r.cantidad}</span>
              <span className="shrink-0 font-medium text-[var(--text-color-defult)]">
                {formatPrice(r.total)}
              </span>
            </div>
          ))}
        </div>
      ) : null}
      <div className="mt-2 flex items-baseline justify-between gap-2 border-t border-[var(--color-border)] pt-2">
        <span className="font-semibold text-[var(--text-color-defult)]">Total</span>
        <span className="shrink-0 font-semibold text-[var(--color-accent)]">
          {formatPrice(total)}
        </span>
      </div>

      {snapshotDiffs.length > 0 ? (
        <div className="rounded-xl border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] px-3 py-2.5 text-[11px] leading-5 text-[var(--color-warning-text)]">
          <p className="font-semibold">
            El catálogo cambió desde que se guardó este trabajo.
          </p>
          <p className="mt-1">
            Este resumen usa los valores históricos guardados. {snapshotDiffs.length === 1 ? "Hay 1 item" : `Hay ${snapshotDiffs.length} items`} con diferencia frente al catálogo actual.
          </p>
          <div className="mt-1.5 space-y-1">
            {snapshotDiffs.slice(0, 3).map((item) => (
              <p key={`${item.nombre}-${item.snapshotPrecio}`}>
                {item.nombre}: {item.missing ? "ya no existe en catálogo" : `${formatPrice(item.snapshotPrecio)} vs. ${formatPrice(item.currentPrecio ?? 0)}`}
              </p>
            ))}
            {snapshotDiffs.length > 3 ? (
              <p>Y {snapshotDiffs.length - 3} más.</p>
            ) : null}
          </div>
          {refreshSnapshotPricesAction ? (
            <form action={refreshAction} className="mt-2">
              <Button type="submit" size="sm" variant="secondary" className="h-auto min-h-9 whitespace-normal px-3 py-2" disabled={refreshPending}>
                {refreshPending ? "Actualizando…" : "Actualizar precios"}
              </Button>
            </form>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
