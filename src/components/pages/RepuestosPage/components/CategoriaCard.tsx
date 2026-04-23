"use client";

import { useActionState, useEffect, useState } from "react";
import type { RepuestoAgrupado } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Divider } from "@/components/ui/Divider";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { PulsatingButton } from "@/components/ui/PulsatingButton";
import { SortableList } from "@/components/sortable/SortableList";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmDelete2, setConfirmDelete2] = useState(false);
  const [confirmedYes, setConfirmedYes] = useState(false);

  const [renameState, renameFormAction, renamePending] = useActionState(renameCategoriaAction, { error: null });
  const [deleteState, deleteFormAction, deletePending] = useActionState(deleteCategoriaAction, { error: null });
  const [saveState, saveFormAction, savePending] = useActionState(updateCategoriaAction, { error: null });

  useEffect(() => {
    if (saveState.success) setIsEditing(false);
  }, [saveState]);

  const formId = `save-repuestos-cat-${grupo.categoriaId}`;
  const deleteFormId = `delete-cat-${grupo.categoriaId}`;

  function handleCancel() {
    setIsEditing(false);
    setResetKey((k) => k + 1);
  }

  return (
    <Card as="section" className="CategoriaCard space-y-0 overflow-hidden !p-0">
      <form id={formId} action={saveFormAction} className="hidden" />
      <form id={deleteFormId} action={deleteFormAction} className="hidden">
        <input type="hidden" name="categoriaId" value={grupo.categoriaId} />
      </form>

      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 pb-2 pt-4 sm:flex-row sm:items-center sm:gap-2 sm:px-8 sm:py-5">

        {/* Fila 1 (siempre): icono + nombre/input */}
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
                className="min-w-0 flex-1 rounded-lg border border-[var(--color-border)] bg-white px-2 py-1 text-sm font-semibold uppercase tracking-widest text-[var(--text-color-defult)] transition focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
              />
              <Button
                type="submit"
                disabled={renamePending}
                title="Guardar nombre"
                variant="outline-ghost"
                className="shrink-0 h-auto p-1.5"
                icon={renamePending ? <Spinner className="h-3.5 w-3.5" /> : <Icon name="check" className="h-3.5 w-3.5" />}
              />
            </form>
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
              />
              <Button
                type="button"
                variant="outline-ghost"
                disabled={deletePending}
                title="Eliminar categoría"
                className="shrink-0 h-auto p-1.5"
                onClick={() => setConfirmDelete(true)}
                icon={<Icon name="trash" className="h-4 w-4" />}
              />
              <ConfirmDialog
                open={confirmDelete}
                onOpenChange={setConfirmDelete}
                title={`¿Eliminar "${grupo.categoriaNombre}"?`}
                description="Se eliminarán todos los repuestos de esta categoría. Esta acción no se puede deshacer."
                confirmLabel="Continuar"
                loading={deletePending}
                onConfirm={() => {
                  setConfirmDelete(false);
                  setConfirmedYes(false);
                  setConfirmDelete2(true);
                }}
              />
              {/* Segundo dialog de confirmación */}
              <Dialog
                open={confirmDelete2}
                onOpenChange={(open) => {
                  if (!open) { setConfirmDelete2(false); setConfirmedYes(false); }
                }}
              >
                <DialogContent variant="centered">
                  <DialogHeader>
                    <DialogTitle>¿Realmente querés eliminar esta categoría?</DialogTitle>
                  </DialogHeader>
                  <div className="px-5 py-4">
                    <p className="mb-4 text-sm text-[var(--text-color-gray)]">
                      Esta acción borrará la categoría y todos sus repuestos. No se puede deshacer.
                    </p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => { setConfirmDelete2(false); setConfirmedYes(false); }}
                        className={`flex-1 rounded-xl border-2 py-5 text-xl font-bold transition ${
                          confirmedYes === false && !confirmedYes
                            ? "border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--text-color-defult)]"
                            : "border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--text-color-defult)]"
                        } hover:border-[var(--color-danger-text)] hover:bg-red-50 hover:text-[var(--color-danger-text)]`}
                      >
                        NO
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmedYes(true)}
                        className={`flex-1 rounded-xl border-2 py-5 text-xl font-bold transition ${
                          confirmedYes
                            ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                            : "border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--text-color-defult)] hover:border-[var(--color-accent)] hover:bg-orange-50 hover:text-[var(--color-accent)]"
                        }`}
                      >
                        SÍ
                      </button>
                    </div>
                  </div>
                  <DialogFooter className="items-stretch">
                    <Button
                      type="button"
                      variant="dark"
                      disabled={!confirmedYes || deletePending}
                      className="h-auto min-h-11 flex-1 whitespace-normal px-3 py-2 text-center leading-5 disabled:opacity-40"
                      onClick={() => {
                        setConfirmDelete2(false);
                        setConfirmedYes(false);
                        const form = document.getElementById(deleteFormId) as HTMLFormElement | null;
                        form?.requestSubmit();
                      }}
                      icon={<Icon name="trash" className="h-4 w-4" />}
                    >
                      {deletePending ? "Eliminando…" : "Eliminar categoría"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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

      <RowError error={renameState.error ?? deleteState.error ?? saveState.error} />

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
