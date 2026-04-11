"use client";

import { useActionState, useEffect, useState } from "react";
import type { TrabajoAgrupado } from "@/lib/types";
import type { CatalogActionState } from "@/app/precios/actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { buttonStyles } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { SortableTrabajoList } from "./SortableTrabajoList";

// ─── Edit / Save buttons (rendered top and bottom) ───────────────────────────

function EditSaveButtons({
  formId,
  isEditing,
  isPending,
  onEdit,
  onCancel,
}: {
  formId: string;
  isEditing: boolean;
  isPending: boolean;
  onEdit: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        form={formId}
        type="submit"
        disabled={isPending}
        className={buttonStyles()}
      >
        <Icon name="check" className="h-4 w-4" />
        {isPending ? "Guardando…" : "Guardar"}
      </button>

      {isEditing ? (
        <button
          type="button"
          onClick={onCancel}
          className={buttonStyles({ variant: "secondary" })}
        >
          Cancelar
        </button>
      ) : (
        <button
          type="button"
          onClick={onEdit}
          className={buttonStyles({ variant: "secondary" })}
        >
          <Icon name="edit" className="h-4 w-4" />
          Editar
        </button>
      )}
    </div>
  );
}

// ─── Category card ────────────────────────────────────────────────────────────

function CategoriaCard({
  grupo,
  renameCategoriaAction,
  deleteCategoriaAction,
  createTrabajoAction,
  deleteTrabajoAction,
  reorderTrabajosAction,
  updateCategoriaAction,
}: {
  grupo: TrabajoAgrupado;
  renameCategoriaAction: (state: CatalogActionState, formData: FormData) => Promise<CatalogActionState>;
  deleteCategoriaAction: (state: CatalogActionState, formData: FormData) => Promise<CatalogActionState>;
  createTrabajoAction: (state: CatalogActionState, formData: FormData) => Promise<CatalogActionState>;
  deleteTrabajoAction: (state: CatalogActionState, formData: FormData) => Promise<CatalogActionState>;
  reorderTrabajosAction: (orderedIds: number[]) => Promise<void>;
  updateCategoriaAction: (state: CatalogActionState, formData: FormData) => Promise<CatalogActionState>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const [renameState, renameFormAction, renamePending] = useActionState(renameCategoriaAction, { error: null });
  const [deleteState, deleteFormAction, deletePending] = useActionState(deleteCategoriaAction, { error: null });
  const [addState, addFormAction, addPending] = useActionState(createTrabajoAction, { error: null, resetKey: 0 });
  const [saveState, saveFormAction, savePending] = useActionState(updateCategoriaAction, { error: null });

  useEffect(() => {
    if (saveState.success) setIsEditing(false);
  }, [saveState]);

  const formId = `save-cat-${grupo.categoriaId}`;

  function handleCancel() {
    setIsEditing(false);
    setResetKey((k) => k + 1);
  }

  const editSaveButtons = (
    <EditSaveButtons
      formId={formId}
      isEditing={isEditing}
      isPending={savePending}
      onEdit={() => setIsEditing(true)}
      onCancel={handleCancel}
    />
  );

  return (
    <Card as="section" className="space-y-0 overflow-hidden p-0">
      {/* Save form — empty anchor, inputs reference it via form={formId} */}
      <form id={formId} action={saveFormAction} className="hidden" />

      {/* Header: rename + delete + top edit/save buttons */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-2">
        <Icon name="tag" className="h-4 w-4 shrink-0 text-[var(--color-accent)]" />

        <form action={renameFormAction} className="flex flex-1 items-center gap-2" key={grupo.categoriaNombre}>
          <input type="hidden" name="categoriaId" value={grupo.categoriaId} />
          <input
            type="text"
            name="nombre"
            defaultValue={grupo.categoriaNombre}
            required
            className="flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm font-semibold uppercase tracking-wide text-[var(--color-foreground)] transition hover:border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
          />
          <button
            type="submit"
            disabled={renamePending}
            title="Guardar nombre de categoría"
            className="rounded-lg p-1.5 text-[var(--color-foreground-muted)] transition hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-40"
          >
            <Icon name="check" className="h-4 w-4" />
          </button>
        </form>

        <form action={deleteFormAction}>
          <input type="hidden" name="categoriaId" value={grupo.categoriaId} />
          <button
            type="submit"
            disabled={deletePending}
            title="Eliminar categoría"
            className="rounded-lg p-1.5 text-[var(--color-foreground-muted)] transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
          >
            <Icon name="trash" className="h-4 w-4" />
          </button>
        </form>

        <div className="h-5 w-px bg-[var(--color-border)]" />

        {editSaveButtons}

        <span className="ml-2 shrink-0 text-xs text-[var(--color-foreground-muted)]">
          {grupo.trabajos.length} {grupo.trabajos.length === 1 ? "trabajo" : "trabajos"}
        </span>
      </div>

      {(renameState.error || deleteState.error || saveState.error) ? (
        <p className="px-5 py-2 text-xs text-rose-600">
          {renameState.error ?? deleteState.error ?? saveState.error}
        </p>
      ) : null}

      {/* Trabajos */}
      {grupo.trabajos.length === 0 ? (
        <p className="px-5 py-4 text-sm text-[var(--color-foreground-muted)]">
          Sin trabajos. Agregá uno abajo.
        </p>
      ) : (
        <SortableTrabajoList
          key={resetKey}
          trabajos={grupo.trabajos}
          isEditing={isEditing}
          formId={formId}
          deleteTrabajoAction={deleteTrabajoAction}
          reorderAction={reorderTrabajosAction}
        />
      )}

      {/* Bottom: edit/save buttons + add trabajo */}
      <div className="flex flex-wrap items-center gap-3 border-t border-[var(--color-border)] px-5 py-3">
        {editSaveButtons}

        <div className="h-5 w-px bg-[var(--color-border)]" />

        <form
          key={addState.resetKey ?? 0}
          action={addFormAction}
          className="flex flex-1 items-center gap-3"
        >
          <input type="hidden" name="categoriaId" value={grupo.categoriaId} />
          <input
            type="text"
            name="nombre"
            placeholder="Nombre del nuevo trabajo…"
            required
            className="flex-1 rounded-xl border border-dashed border-[var(--color-border)] bg-transparent px-3 py-1.5 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-foreground-muted)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
          />
          <button
            type="submit"
            disabled={addPending}
            className={buttonStyles({ variant: "secondary" })}
          >
            <Icon name="plus" className="h-4 w-4" />
            {addPending ? "Agregando…" : "Agregar trabajo"}
          </button>
          {addState.error ? (
            <p className="text-xs text-rose-600">{addState.error}</p>
          ) : null}
        </form>
      </div>
    </Card>
  );
}

// ─── Add category ─────────────────────────────────────────────────────────────

function AddCategoriaForm({
  action,
}: {
  action: (state: CatalogActionState, formData: FormData) => Promise<CatalogActionState>;
}) {
  const [state, formAction, isPending] = useActionState(action, { error: null, resetKey: 0 });

  return (
    <div className="space-y-2">
      <form key={state.resetKey ?? 0} action={formAction} className="flex gap-3">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre de la nueva categoría…"
          required
          className="flex-1 rounded-[14px] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-foreground-muted)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
        />
        <button type="submit" disabled={isPending} className={buttonStyles()}>
          <Icon name="plus" className="h-4 w-4" />
          {isPending ? "Creando…" : "Nueva categoría"}
        </button>
      </form>
      {state.error ? (
        <p className="text-sm text-rose-600">{state.error}</p>
      ) : null}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type PreciosPageProps = {
  trabajos: TrabajoAgrupado[];
  createCategoriaAction: (state: CatalogActionState, formData: FormData) => Promise<CatalogActionState>;
  renameCategoriaAction: (state: CatalogActionState, formData: FormData) => Promise<CatalogActionState>;
  deleteCategoriaAction: (state: CatalogActionState, formData: FormData) => Promise<CatalogActionState>;
  createTrabajoAction: (state: CatalogActionState, formData: FormData) => Promise<CatalogActionState>;
  deleteTrabajoAction: (state: CatalogActionState, formData: FormData) => Promise<CatalogActionState>;
  reorderTrabajosAction: (orderedIds: number[]) => Promise<void>;
  updateCategoriaAction: (state: CatalogActionState, formData: FormData) => Promise<CatalogActionState>;
};

export function PreciosPage({
  trabajos,
  createCategoriaAction,
  renameCategoriaAction,
  deleteCategoriaAction,
  createTrabajoAction,
  deleteTrabajoAction,
  reorderTrabajosAction,
  updateCategoriaAction,
}: PreciosPageProps) {
  const totalTrabajos = trabajos.reduce((sum, g) => sum + g.trabajos.length, 0);

  return (
    <div className="PreciosPage space-y-6">
      <PageHeader
        eyebrow="Configuración"
        title="Lista de precios"
        description={`${totalTrabajos} trabajos en ${trabajos.length} categorías.`}
      />

      <div className="space-y-4">
        {trabajos.map((grupo) => (
          <CategoriaCard
            key={grupo.categoriaId}
            grupo={grupo}
            renameCategoriaAction={renameCategoriaAction}
            deleteCategoriaAction={deleteCategoriaAction}
            createTrabajoAction={createTrabajoAction}
            deleteTrabajoAction={deleteTrabajoAction}
            reorderTrabajosAction={reorderTrabajosAction}
            updateCategoriaAction={updateCategoriaAction}
          />
        ))}
      </div>

      <AddCategoriaForm action={createCategoriaAction} />
    </div>
  );
}
