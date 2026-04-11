"use client";

import { useActionState, useEffect, useState } from "react";
import type { TrabajoAgrupado } from "@/lib/types";
import type { CatalogActionState } from "@/app/(app)/precios/actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { buttonStyles } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { SortableTrabajoList } from "./SortableTrabajoList";

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

  return (
    <Card as="section" className="space-y-0 overflow-hidden p-0">
      {/* Save form — hidden anchor, inputs reference it via form={formId} */}
      <form id={formId} action={saveFormAction} className="hidden" />

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2">

        {/* Nombre de categoría (editable inline) */}
        <form action={renameFormAction} className="flex min-w-0 flex-1 items-center gap-1" key={grupo.categoriaNombre}>
          <input type="hidden" name="categoriaId" value={grupo.categoriaId} />
          <Icon name="tag" className="h-4 w-4 shrink-0 text-[var(--color-accent)]" />
          <input
            type="text"
            name="nombre"
            defaultValue={grupo.categoriaNombre}
            required
            className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm font-semibold uppercase tracking-widest text-[var(--color-foreground)] transition hover:border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
          />
          <button
            type="submit"
            disabled={renamePending}
            title="Guardar nombre"
            className="rounded-lg p-1.5 text-[var(--color-foreground-muted)] transition hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-40"
          >
            <Icon name="check" className="h-3.5 w-3.5" />
          </button>
        </form>

        {/* Separador */}
        <div className="h-5 w-px bg-[var(--color-border)]" />

        {/* Contador */}
        <span className="shrink-0 rounded-full bg-[var(--color-border)] px-2 py-0.5 text-xs font-medium text-[var(--color-foreground-muted)]">
          {grupo.trabajos.length} {grupo.trabajos.length === 1 ? "trabajo" : "trabajos"}
        </span>

        {/* Separador */}
        <div className="h-5 w-px bg-[var(--color-border)]" />

        {/* Editar precios / Guardar+Cancelar */}
        {isEditing ? (
          <div className="flex items-center gap-1.5">
            <button
              form={formId}
              type="submit"
              disabled={savePending}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              <Icon name="check" className="h-3.5 w-3.5" />
              {savePending ? "Guardando…" : "Guardar"}
            </button>
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
            Editar precios
          </button>
        )}

        {/* Eliminar categoría */}
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
      </div>

      {/* Errores */}
      {(renameState.error || deleteState.error || saveState.error) && (
        <p className="px-5 py-2 text-xs text-rose-600">
          {renameState.error ?? deleteState.error ?? saveState.error}
        </p>
      )}

      {/* ── Trabajos ── */}
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
          dndId={`dnd-cat-${grupo.categoriaId}`}
        />
      )}

      {/* ── Footer: agregar trabajo ── */}
      <div className="flex flex-wrap items-center gap-3 bg-sky-50 px-5 py-3" style={{ borderTop: "2px dashed #93c5fd" }}>
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
            className="flex-1 rounded-xl border border-sky-200 bg-white/80 px-3 py-1.5 text-sm text-[var(--color-foreground)] placeholder:text-sky-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300/40 backdrop-blur-sm"
          />
          <button
            type="submit"
            disabled={addPending}
            className={buttonStyles({ className: "gap-2 !text-white bg-sky-600 uppercase hover:bg-sky-700" })}
          >
            <Icon name="plus" className="h-4 w-4" />
            {addPending ? "Agregando…" : "Agregar trabajo"}
          </button>
          {addState.error && (
            <p className="text-xs text-rose-600">{addState.error}</p>
          )}
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
      <form key={state.resetKey ?? 0} action={formAction} className="flex gap-3 rounded-[18px] bg-sky-50 px-4 py-3" style={{ border: "2px dashed #93c5fd" }}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre de la nueva categoría…"
          required
          className="flex-1 rounded-xl border border-sky-200 bg-white/80 px-4 py-2 text-sm text-[var(--color-foreground)] placeholder:text-sky-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300/40"
        />
        <button
          type="submit"
          disabled={isPending}
          className={buttonStyles({ className: "gap-2 !text-white bg-sky-600 uppercase hover:bg-sky-700" })}
        >
          <Icon name="plus" className="h-4 w-4" />
          {isPending ? "Creando…" : "Nueva categoría"}
        </button>
      </form>
      {state.error && (
        <p className="text-sm text-rose-600">{state.error}</p>
      )}
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
