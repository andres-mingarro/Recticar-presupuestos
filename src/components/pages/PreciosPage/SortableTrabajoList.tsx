"use client";

import { useOptimistic, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/cn";
import type { TrabajoAgrupado } from "@/lib/types";
import type { CatalogActionState } from "@/app/(app)/precios/actions";
import { DeleteTrabajoForm } from "./DeleteTrabajoForm";

type Trabajo = TrabajoAgrupado["trabajos"][number];

const LISTA_COLORS = [
  "bg-sky-50 text-sky-700 border-sky-200",
  "bg-violet-50 text-violet-700 border-violet-200",
  "bg-emerald-50 text-emerald-700 border-emerald-200",
];

function formatPrecio(value: number | null | undefined) {
  if (!value) return "$0";
  return `$${value.toLocaleString("es-AR")}`;
}

function DragHandle(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-label="Reordenar"
      className="cursor-grab touch-none text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)] active:cursor-grabbing"
      {...props}
    >
      <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" stroke="none">
        <circle cx="9" cy="6" r="1.5" />
        <circle cx="15" cy="6" r="1.5" />
        <circle cx="9" cy="12" r="1.5" />
        <circle cx="15" cy="12" r="1.5" />
        <circle cx="9" cy="18" r="1.5" />
        <circle cx="15" cy="18" r="1.5" />
      </svg>
    </button>
  );
}

function SortableTrabajoRow({
  trabajo,
  index,
  isEditing,
  formId,
  deleteTrabajoAction,
}: {
  trabajo: Trabajo;
  index: number;
  isEditing: boolean;
  formId: string;
  deleteTrabajoAction: (state: CatalogActionState, formData: FormData) => Promise<CatalogActionState>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: trabajo.id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  const precios = [trabajo.precioLista1, trabajo.precioLista2, trabajo.precioLista3];
  const names = ["precio_lista_1", "precio_lista_2", "precio_lista_3"];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 px-5 py-3",
        index % 2 === 1 && "bg-[var(--color-surface-alt)]/40",
        isDragging && "z-10 rounded-xl shadow-lg opacity-90 bg-white"
      )}
    >
      <DragHandle {...attributes} {...listeners} />

      {/* Nombre */}
      <input
        form={formId}
        type="text"
        name={`nombre_${trabajo.id}`}
        defaultValue={trabajo.nombre}
        disabled={!isEditing}
        required
        className={cn(
          "flex-1 rounded-lg px-2 py-1 text-sm text-[var(--color-foreground)] transition",
          isEditing
            ? "border border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
            : "border border-transparent bg-transparent font-medium"
        )}
      />

      {/* Precios */}
      <div className="flex shrink-0 items-center gap-2">
        {precios.map((precio, i) =>
          isEditing ? (
            <input
              key={i}
              form={formId}
              type="number"
              name={`${names[i]}_${trabajo.id}`}
              defaultValue={precio ?? 0}
              min="0"
              step="1"
              inputMode="numeric"
              className="w-24 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-right text-sm font-medium text-[var(--color-foreground)] transition focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
            />
          ) : (
            <span
              key={i}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold",
                LISTA_COLORS[i]
              )}
            >
              <span className="opacity-60">L{i + 1}</span>
              {formatPrecio(precio)}
            </span>
          )
        )}
      </div>

      {isEditing && <DeleteTrabajoForm trabajoId={trabajo.id} action={deleteTrabajoAction} />}
    </div>
  );
}

export function SortableTrabajoList({
  trabajos,
  isEditing,
  formId,
  deleteTrabajoAction,
  reorderAction,
  dndId,
}: {
  trabajos: Trabajo[];
  isEditing: boolean;
  formId: string;
  deleteTrabajoAction: (state: CatalogActionState, formData: FormData) => Promise<CatalogActionState>;
  reorderAction: (orderedIds: number[]) => Promise<void>;
  dndId: string;
}) {
  const [optimisticTrabajos, setOptimisticTrabajos] = useOptimistic(trabajos);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = optimisticTrabajos.findIndex((t) => t.id === active.id);
    const newIndex = optimisticTrabajos.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(optimisticTrabajos, oldIndex, newIndex);
    startTransition(async () => {
      setOptimisticTrabajos(reordered);
      await reorderAction(reordered.map((t) => t.id));
    });
  }

  return (
    <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={optimisticTrabajos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        {/* Column headers — solo en modo edición */}
        {isEditing && (
          <div className="flex items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface-alt)] px-5 py-1.5">
            <div className="w-4" />
            <span className="flex-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-foreground-muted)]">Trabajo</span>
            <div className="flex shrink-0 gap-2">
              {["Lista 1", "Lista 2", "Lista 3"].map((l) => (
                <span key={l} className="w-24 text-center text-[11px] font-semibold uppercase tracking-wider text-[var(--color-foreground-muted)]">{l}</span>
              ))}
            </div>
            <div className="w-7" />
          </div>
        )}
        <div className="divide-y divide-[var(--color-border)]">
          {optimisticTrabajos.map((trabajo, index) => (
            <SortableTrabajoRow
              key={trabajo.id}
              trabajo={trabajo}
              index={index}
              isEditing={isEditing}
              formId={formId}
              deleteTrabajoAction={deleteTrabajoAction}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
