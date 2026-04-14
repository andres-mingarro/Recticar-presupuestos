"use client";

import { useActionState, useEffect, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { RepuestosActionState } from "@/app/(app)/repuestos/actions";
import type { RepuestoAgrupado } from "@/lib/types";
import { cn } from "@/lib/cn";
import { DeleteItemForm } from "@/components/forms/DeleteItemForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { buttonStyles } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { Icon } from "@/components/ui/Icon";
import { SortableList } from "@/components/sortable/SortableList";
import { Spinner } from "@/components/ui/Spinner";
import { PulsatingButton } from "@/components/ui/PulsatingButton";

type Repuesto = RepuestoAgrupado["repuestos"][number];

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

function SortableRepuestoRow({
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
  deleteRepuestoAction: (
    state: RepuestosActionState,
    formData: FormData
  ) => Promise<RepuestosActionState>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: repuesto.id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 px-5 py-3",
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
        className={cn(
          "flex-1 rounded-lg px-2 py-1 text-sm text-[var(--color-foreground)] transition",
          isEditing
            ? "border border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
            : "border border-transparent bg-transparent font-medium"
        )}
      />

      {isEditing ? (
        <input
          form={formId}
          type="number"
          name={`precio_${repuesto.id}`}
          defaultValue={repuesto.precio ?? 0}
          min="0"
          step="1"
          inputMode="numeric"
          className="w-28 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-right text-sm font-medium text-[var(--color-foreground)] transition focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
        />
      ) : (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--color-info-border)] bg-[var(--color-info-bg)] px-3 py-1 text-xs font-semibold text-[var(--color-info-text-strong)]">
          {formatPrecio(repuesto.precio)}
        </span>
      )}

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

function CategoriaCard({
  grupo,
  renameCategoriaAction,
  deleteCategoriaAction,
  createRepuestoAction,
  deleteRepuestoAction,
  reorderRepuestosAction,
  updateCategoriaAction,
}: {
  grupo: RepuestoAgrupado;
  renameCategoriaAction: (
    state: RepuestosActionState,
    formData: FormData
  ) => Promise<RepuestosActionState>;
  deleteCategoriaAction: (
    state: RepuestosActionState,
    formData: FormData
  ) => Promise<RepuestosActionState>;
  createRepuestoAction: (
    state: RepuestosActionState,
    formData: FormData
  ) => Promise<RepuestosActionState>;
  deleteRepuestoAction: (
    state: RepuestosActionState,
    formData: FormData
  ) => Promise<RepuestosActionState>;
  reorderRepuestosAction: (orderedIds: number[]) => Promise<void>;
  updateCategoriaAction: (
    state: RepuestosActionState,
    formData: FormData
  ) => Promise<RepuestosActionState>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const [renameState, renameFormAction, renamePending] = useActionState(renameCategoriaAction, { error: null });
  const [deleteState, deleteFormAction, deletePending] = useActionState(deleteCategoriaAction, { error: null });
  const [addState, addFormAction, addPending] = useActionState(createRepuestoAction, { error: null, resetKey: 0 });
  const [saveState, saveFormAction, savePending] = useActionState(updateCategoriaAction, { error: null });

  useEffect(() => {
    if (saveState.success) setIsEditing(false);
  }, [saveState]);

  const formId = `save-repuestos-cat-${grupo.categoriaId}`;

  function handleCancel() {
    setIsEditing(false);
    setResetKey((k) => k + 1);
  }

  return (
    <Card as="section" className="space-y-0 overflow-hidden p-0">
      <form id={formId} action={saveFormAction} className="hidden" />

      <div className="flex items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <Icon name="package" className="h-4 w-4 shrink-0 text-[var(--color-accent)]" />
          {isEditing ? (
            <form action={renameFormAction} className="flex min-w-0 flex-1 items-center gap-1" key={grupo.categoriaNombre}>
              <input type="hidden" name="categoriaId" value={grupo.categoriaId} />
              <input
                type="text"
                name="nombre"
                defaultValue={grupo.categoriaNombre}
                required
                className="min-w-0 flex-1 rounded-lg border border-[var(--color-border)] bg-white px-2 py-1 text-sm font-semibold uppercase tracking-widest text-[var(--color-foreground)] transition focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
              />
              <button
                type="submit"
                disabled={renamePending}
                title="Guardar nombre"
                className="rounded-lg p-1.5 text-[var(--color-foreground-muted)] transition hover:bg-[var(--color-success-bg)] hover:text-[var(--color-success-text)] disabled:opacity-40"
              >
                {renamePending ? <Spinner className="h-3.5 w-3.5" /> : <Icon name="check" className="h-3.5 w-3.5" />}
              </button>
            </form>
          ) : (
            <span className="text-sm font-semibold uppercase tracking-widest text-[var(--color-foreground)]">
              {grupo.categoriaNombre}
            </span>
          )}
        </div>

        <Divider orientation="vertical" className="h-5" />

        <span className="shrink-0 rounded-full bg-[var(--color-border)] px-2 py-0.5 text-xs font-medium text-[var(--color-foreground-muted)]">
          {grupo.repuestos.length} {grupo.repuestos.length === 1 ? "repuesto" : "repuestos"}
        </span>

        <Divider orientation="vertical" className="h-5" />

        {isEditing ? (
          <div className="flex items-center gap-1.5">
            <PulsatingButton
              form={formId}
              type="submit"
              pulsing={!savePending}
              disabled={savePending}
              className="flex items-center gap-1.5 rounded-lg bg-[var(--color-success-text)] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[var(--color-success-text-strong)] disabled:opacity-60"
            >
              {savePending ? <Spinner className="h-3.5 w-3.5" /> : <Icon name="check" className="h-3.5 w-3.5" />}
              {savePending ? "Guardando…" : "Guardar"}
            </PulsatingButton>
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-foreground-muted)] transition hover:bg-[var(--color-surface-raised)]"
            >
              <Icon name="x" className="h-3.5 w-3.5" />
              Cancelar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-foreground-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            <Icon name="edit" className="h-3.5 w-3.5" />
            Editar categoría
          </button>
        )}

        {isEditing && (
          <form
            action={deleteFormAction}
            onSubmit={(e) => {
              if (!confirm(`¿Eliminar la categoría "${grupo.categoriaNombre}" y todos sus repuestos? Esta acción no se puede deshacer.`)) {
                e.preventDefault();
              }
            }}
          >
            <input type="hidden" name="categoriaId" value={grupo.categoriaId} />
            <button
              type="submit"
              disabled={deletePending}
              title="Eliminar categoría"
              className="rounded-lg p-1.5 text-[var(--color-foreground-muted)] transition hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger-text)] disabled:opacity-40"
            >
              <Icon name="trash" className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>

      {(renameState.error || deleteState.error || saveState.error) && (
        <p className="px-5 py-2 text-xs text-[var(--color-danger-text)]">
          {renameState.error ?? deleteState.error ?? saveState.error}
        </p>
      )}

      {grupo.repuestos.length === 0 ? (
        <p className="px-5 py-4 text-sm text-[var(--color-foreground-muted)]">
          Sin repuestos. Agregá uno abajo.
        </p>
      ) : (
        <SortableList
          key={resetKey}
          items={grupo.repuestos}
          dndId={`dnd-repuestos-cat-${grupo.categoriaId}`}
          onReorder={reorderRepuestosAction}
          renderHeader={
            isEditing ? (
              <div className="flex items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface-alt)] px-5 py-1.5">
                <div className="w-4" />
                <span className="flex-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-foreground-muted)]">
                  Repuesto
                </span>
                <span className="w-28 text-center text-[11px] font-semibold uppercase tracking-wider text-[var(--color-foreground-muted)]">
                  Valor
                </span>
                <div className="w-7" />
              </div>
            ) : null
          }
          renderItem={(repuesto, index) => (
            <SortableRepuestoRow
              key={repuesto.id}
              repuesto={repuesto}
              index={index}
              isEditing={isEditing}
              formId={formId}
              deleteRepuestoAction={deleteRepuestoAction}
            />
          )}
        />
      )}

      {isEditing && (
        <div
          className="flex flex-wrap items-center gap-3 bg-[var(--color-info-bg)] px-5 py-3"
          style={{ borderTop: "2px dashed var(--color-info-border-strong)" }}
        >
          <form
            key={addState.resetKey ?? 0}
            action={addFormAction}
            className="flex flex-1 items-center gap-3"
          >
            <input type="hidden" name="categoriaId" value={grupo.categoriaId} />
            <input
              type="text"
              name="nombre"
              placeholder="Nombre del nuevo repuesto…"
              required
              className="flex-1 rounded-xl border border-[var(--color-info-border)] bg-white/80 px-3 py-1.5 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-info-border-strong)] focus:border-[var(--color-info-border-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--color-info-border)]/40 backdrop-blur-sm"
            />
            <button
              type="submit"
              disabled={addPending}
              className={buttonStyles({ className: "gap-2 !text-white bg-[var(--color-info-text)] uppercase hover:bg-[var(--color-info-text-strong)]" })}
            >
              {addPending ? <Spinner className="h-4 w-4" /> : <Icon name="plus" className="h-4 w-4" />}
              {addPending ? "Agregando…" : "Agregar repuesto"}
            </button>
            {addState.error ? (
              <p className="text-xs text-[var(--color-danger-text)]">{addState.error}</p>
            ) : null}
          </form>
        </div>
      )}
    </Card>
  );
}

function AddCategoriaForm({
  action,
}: {
  action: (state: RepuestosActionState, formData: FormData) => Promise<RepuestosActionState>;
}) {
  const [state, formAction, isPending] = useActionState(action, { error: null, resetKey: 0 });

  return (
    <div className="space-y-2">
      <form
        key={state.resetKey ?? 0}
        action={formAction}
        className="flex gap-3 rounded-[18px] bg-[var(--color-info-bg)] px-4 py-3"
        style={{ border: "2px dashed var(--color-info-border-strong)" }}
      >
        <input
          type="text"
          name="nombre"
          placeholder="Nombre de la nueva categoría…"
          required
          className="flex-1 rounded-xl border border-[var(--color-info-border)] bg-white/80 px-4 py-2 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-info-border-strong)] focus:border-[var(--color-info-border-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--color-info-border)]/40"
        />
        <button
          type="submit"
          disabled={isPending}
          className={buttonStyles({ className: "gap-2 !text-white bg-[var(--color-info-text)] uppercase hover:bg-[var(--color-info-text-strong)]" })}
        >
          {isPending ? <Spinner className="h-4 w-4" /> : <Icon name="plus" className="h-4 w-4" />}
          {isPending ? "Creando…" : "Nueva categoría"}
        </button>
      </form>
      {state.error ? (
        <p className="text-sm text-[var(--color-danger-text)]">{state.error}</p>
      ) : null}
    </div>
  );
}

type RepuestosPageProps = {
  repuestos: RepuestoAgrupado[];
  createCategoriaAction: (
    state: RepuestosActionState,
    formData: FormData
  ) => Promise<RepuestosActionState>;
  renameCategoriaAction: (
    state: RepuestosActionState,
    formData: FormData
  ) => Promise<RepuestosActionState>;
  deleteCategoriaAction: (
    state: RepuestosActionState,
    formData: FormData
  ) => Promise<RepuestosActionState>;
  createRepuestoAction: (
    state: RepuestosActionState,
    formData: FormData
  ) => Promise<RepuestosActionState>;
  deleteRepuestoAction: (
    state: RepuestosActionState,
    formData: FormData
  ) => Promise<RepuestosActionState>;
  reorderRepuestosAction: (orderedIds: number[]) => Promise<void>;
  updateCategoriaAction: (
    state: RepuestosActionState,
    formData: FormData
  ) => Promise<RepuestosActionState>;
};

export function RepuestosPage({
  repuestos,
  createCategoriaAction,
  renameCategoriaAction,
  deleteCategoriaAction,
  createRepuestoAction,
  deleteRepuestoAction,
  reorderRepuestosAction,
  updateCategoriaAction,
}: RepuestosPageProps) {
  const totalRepuestos = repuestos.reduce((sum, g) => sum + g.repuestos.length, 0);

  return (
    <div className="RepuestosPage space-y-6">
      <PageHeader
        eyebrow="Configuración"
        title="Repuestos"
        description={`${totalRepuestos} repuestos en ${repuestos.length} categorías.`}
      />

      <div className="space-y-4">
        {repuestos.map((grupo) => (
          <CategoriaCard
            key={grupo.categoriaId}
            grupo={grupo}
            renameCategoriaAction={renameCategoriaAction}
            deleteCategoriaAction={deleteCategoriaAction}
            createRepuestoAction={createRepuestoAction}
            deleteRepuestoAction={deleteRepuestoAction}
            reorderRepuestosAction={reorderRepuestosAction}
            updateCategoriaAction={updateCategoriaAction}
          />
        ))}
      </div>

      <AddCategoriaForm action={createCategoriaAction} />
    </div>
  );
}
