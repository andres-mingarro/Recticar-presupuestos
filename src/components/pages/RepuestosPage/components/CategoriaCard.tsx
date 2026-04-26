"use client";

import { useActionState, useEffect, useState } from "react";
import type { RepuestoAgrupado } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { PulsatingButton } from "@/components/ui/PulsatingButton";
import { SortableList } from "@/components/sortable/SortableList";
import { DeleteItemForm } from "@/components/forms/DeleteItemForm";
import { RowError, type RepuestosActionFn } from "./shared";
import { SortableRepuestoRow } from "./SortableRepuestoRow";
import { AddRepuestoForm } from "./AddRepuestoForm";

export function CategoriaCard({
  grupo,
  renameCategoriaAction,
  deleteCategoriaAction,
  createRepuestoAction,
  deleteRepuestoAction,
  reorderRepuestosAction,
  updateCategoriaAction,
}: {
  grupo: RepuestoAgrupado;
  renameCategoriaAction: RepuestosActionFn;
  deleteCategoriaAction: RepuestosActionFn;
  createRepuestoAction: RepuestosActionFn;
  deleteRepuestoAction: RepuestosActionFn;
  reorderRepuestosAction: (orderedIds: number[]) => Promise<void>;
  updateCategoriaAction: RepuestosActionFn;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [resetKey, setResetKey] = useState(0);

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
    <Card as="section" className="CategoriaCard space-y-0 overflow-hidden !p-0">
      <form id={formId} action={saveFormAction} className="hidden">
        <input type="hidden" name="categoriaId" value={grupo.categoriaId} />
      </form>

      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 pb-2 pt-4 sm:flex-row sm:items-center sm:gap-2 sm:px-8 sm:py-5">

        {/* Fila 1 (siempre): icono + nombre/input */}
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <Icon name="package" className="h-4 w-4 shrink-0 text-[var(--color-accent)]" />
          {isEditing ? (
            <input
              form={formId}
              type="text"
              name="nombre"
              defaultValue={grupo.categoriaNombre}
              required
              className="min-w-0 flex-1 rounded-lg border border-[var(--color-border)] bg-white px-2 py-1 text-sm font-semibold uppercase tracking-widest text-[var(--text-color-defult)] transition focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
            />
          ) : (
            <span className="text-sm font-semibold uppercase tracking-widest text-[var(--text-color-defult)]">
              {grupo.categoriaNombre}
            </span>
          )}
        </div>

        {/* Fila 2 en mobile (misma fila en desktop): badge + acciones */}
        <div className="flex items-center justify-between gap-2 sm:shrink-0 sm:justify-end">
          <span className="rounded-full bg-[var(--color-border)] px-2 py-0.5 text-xs font-medium text-[var(--text-color-gray)]">
            {grupo.repuestos.length} {grupo.repuestos.length === 1 ? "repuesto" : "repuestos"}
          </span>
          <Divider orientation="vertical" className="h-5" />
          {isEditing ? (
            <div className="flex items-center gap-1.5">
              <PulsatingButton
                form={formId}
                type="submit"
                size="sm"
                pulsing={!savePending}
                disabled={savePending}
                className="inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap rounded-lg border border-[var(--color-border)] bg-white px-2 py-1.5 text-xs font-semibold text-[var(--text-color-gray)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-40 sm:px-3"
              >
                {savePending ? <Spinner className="h-3.5 w-3.5" /> : null}
                {savePending ? "Guardando…" : "Guardar"}
              </PulsatingButton>
              <Button
                type="button"
                size="sm"
                variant="outline-ghost"
                onClick={handleCancel}
                icon={<Icon name="x" className="h-3.5 w-3.5" />}
              >
                Cancelar
              </Button>
              <DeleteItemForm
                itemId={grupo.categoriaId}
                idFieldName="categoriaId"
                title="Eliminar categoría"
                confirmDescription={`Se eliminarán todos los repuestos de "${grupo.categoriaNombre}". Esta acción no se puede deshacer.`}
                doubleConfirm
                doubleConfirmDescription={`Esta acción borrará la categoría "${grupo.categoriaNombre}" y todos sus repuestos. No se puede deshacer.`}
                action={deleteCategoriaAction}
              />
            </div>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline-ghost"
              onClick={() => setIsEditing(true)}
              icon={<Icon name="edit" className="h-3.5 w-3.5" />}
            >
              <span className="hidden sm:inline">Editar categoría</span>
            </Button>
          )}
        </div>
      </div>

      <RowError error={saveState.error} />

      {/* Lista de repuestos */}
      {grupo.repuestos.length === 0 ? (
        <p className="px-5 py-4 text-sm text-[var(--text-color-gray)]">
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
              <div className="flex items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-1.5 sm:px-5">
                <div className="w-4" />
                <span className="flex-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-color-gray)]">
                  Repuesto
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
        <AddRepuestoForm categoriaId={grupo.categoriaId} action={createRepuestoAction} />
      )}
    </Card>
  );
}
