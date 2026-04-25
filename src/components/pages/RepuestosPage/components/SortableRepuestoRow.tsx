"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import type { RepuestoAgrupado } from "@/lib/types";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { DeleteItemForm } from "@/components/forms/DeleteItemForm";
import { PriceInput } from "@/components/ui/PriceInput";
import { fieldCls, readCls, type RepuestosActionFn } from "./shared";
import { DragHandle } from "./DragHandle";

type Repuesto = RepuestoAgrupado["repuestos"][number];

export function SortableRepuestoRow({
  repuesto,
  index,
  isEditing,
  formId,
  deleteRepuestoAction,
}: {
  repuesto: Repuesto;
  index: number;
  isEditing: boolean;
  formId: string;
  deleteRepuestoAction: RepuestosActionFn;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: repuesto.id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  const [stockHabilitado, setStockHabilitado] = useState(repuesto.stockHabilitado);
  const [precioStock, setPrecioStock] = useState(repuesto.precioStock);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "SortableRepuestoRow flex items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-5 sm:py-3",
        index % 2 === 1 && "bg-[var(--color-surface-alt)]/40",
        isDragging && "z-10 rounded-xl bg-white opacity-90 shadow-lg"
      )}
    >
      <DragHandle {...attributes} {...listeners} />
      <input
        form={formId}
        type="text"
        name={`nombre_${repuesto.id}`}
        defaultValue={repuesto.nombre}
        disabled={!isEditing}
        required
        className={cn(isEditing ? fieldCls : readCls, "min-w-0 flex-1")}
      />

      {/* Stock */}
      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            {/* Campos de stock — siempre en DOM, animados con opacity + visibility */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                opacity: stockHabilitado ? 1 : 0,
                visibility: stockHabilitado ? "visible" : "hidden",
                width: stockHabilitado ? "16rem" : 0,
                overflow: "hidden",
                transition: "opacity 0.2s ease, width 0.2s ease",
                pointerEvents: stockHabilitado ? "auto" : "none",
              }}
            >
              <input
                form={formId}
                type="number"
                name={`stock_cantidad_${repuesto.id}`}
                defaultValue={repuesto.stockCantidad}
                min="0"
                step="1"
                inputMode="numeric"
                placeholder="Cant."
                className={cn(fieldCls, "h-8 text-right text-sm shrink-0")}
                style={{ maxWidth: "80px" }}
              />
              {/* input hidden para precio_stock — PriceInput maneja el estado local */}
              <input form={formId} type="hidden" name={`precio_stock_${repuesto.id}`} value={precioStock} />
              <PriceInput
                value={precioStock}
                onChange={setPrecioStock}
                className="h-8 text-sm shrink-0"
                style={{ maxWidth: "160px" }}
                placeholder="$ Precio"
              />
            </div>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                form={formId}
                type="checkbox"
                name={`stock_habilitado_${repuesto.id}`}
                value="true"
                checked={stockHabilitado}
                onChange={(e) => setStockHabilitado(e.target.checked)}
                className="sr-only"
              />
              <span
                className={cn(
                  "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
                  stockHabilitado ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"
                )}
              >
                <span className={cn(
                  "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
                  stockHabilitado ? "translate-x-4" : "translate-x-0"
                )} />
              </span>
              <span className="whitespace-nowrap text-xs font-medium text-[var(--text-color-gray)]">En stock</span>
            </label>
          </>
        ) : (
          repuesto.stockHabilitado && (
            <div className="flex items-center gap-2">
              <div className="inline-flex items-baseline gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5">
                <span className="text-sm font-bold text-[var(--text-color-defult)]">{repuesto.stockCantidad}</span>
                <span className="text-sm font-medium text-[var(--text-color-gray)]">en stock</span>
              </div>
              {repuesto.precioStock > 0 && (
                <div className="inline-flex items-baseline gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5">
                  <span className="text-sm font-bold text-[var(--text-color-defult)]">{formatPrice(repuesto.precioStock)}</span>
                  <span className="text-sm font-medium text-[var(--text-color-gray)]">c/u</span>
                </div>
              )}
            </div>
          )
        )}
      </div>

      {isEditing && (
        <DeleteItemForm
          itemId={repuesto.id}
          idFieldName="repuestoId"
          title="Eliminar repuesto"
          action={deleteRepuestoAction}
        />
      )}
    </div>
  );
}
