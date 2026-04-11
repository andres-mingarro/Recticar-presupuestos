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
import type { CatalogActionState } from "@/app/precios/actions";
import { DeleteTrabajoForm } from "./DeleteTrabajoForm";

type Trabajo = TrabajoAgrupado["trabajos"][number];

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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        tabIndex={-1}
        className="cursor-grab touch-none text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)] active:cursor-grabbing"
        aria-label="Reordenar"
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

      {/* Nombre */}
      <input
        form={formId}
        type="text"
        name={`nombre_${trabajo.id}`}
        defaultValue={trabajo.nombre}
        disabled={!isEditing}
        required
        className={cn(
          "flex-1 rounded-lg px-2 py-1 text-base text-[var(--color-foreground)] transition",
          isEditing
            ? "border border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
            : "border border-transparent bg-transparent"
        )}
      />

      {/* Precio */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--color-foreground-muted)]">$</span>
        <input
          form={formId}
          type="number"
          name={`precio_${trabajo.id}`}
          defaultValue={trabajo.precio}
          min="0"
          step="1"
          className="w-32 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-right text-sm font-medium text-[var(--color-foreground)] transition focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
        />
      </div>

      <DeleteTrabajoForm trabajoId={trabajo.id} action={deleteTrabajoAction} />
    </div>
  );
}

export function SortableTrabajoList({
  trabajos,
  isEditing,
  formId,
  deleteTrabajoAction,
  reorderAction,
}: {
  trabajos: Trabajo[];
  isEditing: boolean;
  formId: string;
  deleteTrabajoAction: (state: CatalogActionState, formData: FormData) => Promise<CatalogActionState>;
  reorderAction: (orderedIds: number[]) => Promise<void>;
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
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={optimisticTrabajos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
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
