"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { RepuestoAgrupado } from "@/lib/types";
import { cn } from "@/lib/cn";
import { DeleteItemForm } from "@/components/forms/DeleteItemForm";
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "SortableRepuestoRow flex items-center gap-3 px-5 py-3",
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
        className={isEditing ? fieldCls : readCls}
      />
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
