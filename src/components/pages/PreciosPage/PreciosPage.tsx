"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import type { TrabajoAgrupado } from "@/lib/types";
import type { CatalogActionState } from "@/app/(app)/precios/actions";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { DeleteItemForm } from "@/components/forms/DeleteItemForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button, buttonStyles } from "@/components/ui/Button";
import { ListPriceBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EngineIcons, EngineIconGlyph, isEngineIconName, type EngineIconName } from "@/components/ui/EngineIcons";
import { Icon } from "@/components/ui/Icon";
import { SortableList } from "@/components/sortable/SortableList";
import { Spinner } from "@/components/ui/Spinner";
import { PulsatingButton } from "@/components/ui/PulsatingButton";
import { Incrementor } from "@/components/ui/Incrementor";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

// ─── Category card ────────────────────────────────────────────────────────────

type Trabajo = TrabajoAgrupado["trabajos"][number];

function formatPrecio(value: number | null | undefined) {
  return formatPrice(value ?? 0);
}

function formatPrecioInput(value: number) {
  return `$${Math.max(0, Math.round(value)).toLocaleString("es-AR")}`;
}

function parsePrecioInput(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

function DragHandle(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-label="Reordenar"
      className="cursor-grab touch-none text-[var(--text-color-gray)] hover:text-[var(--text-color-defult)] active:cursor-grabbing"
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
  preciosDraft,
  onPrecioChange,
  deleteTrabajoAction,
}: {
  trabajo: Trabajo;
  index: number;
  isEditing: boolean;
  formId: string;
  preciosDraft?: { precioLista1: number; precioLista2: number; precioLista3: number };
  onPrecioChange: (trabajoId: number, lista: 1 | 2 | 3, value: number) => void;
  deleteTrabajoAction: (state: CatalogActionState, formData: FormData) => Promise<CatalogActionState>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: trabajo.id });

  const style = { transform: CSS.Transform.toString(transform), transition };
  const precios = [
    preciosDraft?.precioLista1 ?? trabajo.precioLista1,
    preciosDraft?.precioLista2 ?? trabajo.precioLista2,
    preciosDraft?.precioLista3 ?? trabajo.precioLista3,
  ];
  const names = ["precio_lista_1", "precio_lista_2", "precio_lista_3"];
  const mobileListLabels = ["Precios lista 1", "Precios lista 2", "Precios lista 3"];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "precios-item-row flex flex-col md:flex-row items-start md:items-center gap-3 px-5 py-3",
        index % 2 === 1 && "bg-[var(--color-surface-alt)]/40",
        isDragging && "z-10 rounded-xl bg-white opacity-90 shadow-lg"
      )}
    >
      <div className="precios-item-row-header flex w-full gap-2">
        <DragHandle {...attributes} {...listeners} />
        <input
          form={formId}
          type="text"
          name={`nombre_${trabajo.id}`}
          defaultValue={trabajo.nombre}
          disabled={!isEditing}
          tabIndex={isEditing ? -1 : undefined}
          required
          className={cn(
            "flex-1 w-full rounded-lg px-2 py-1 text-sm text-[var(--text-color-defult)] transition",
            isEditing
              ? "border border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
              : "border border-transparent bg-transparent font-medium"
          )}
        />
        {isEditing && (
          <div className="md:hidden">
            <DeleteItemForm
              itemId={trabajo.id}
              idFieldName="trabajoId"
              title="Eliminar trabajo"
              action={deleteTrabajoAction}
            />
          </div>
        )}
      </div>
      <div className="precios-item-row-footer w-full md:w-auto">
        <div className="flex flex-col md:flex-row w-full  md:w-auto items-hrink-0 items-end md:items-center gap-2">
          {precios.map((precio, i) =>
            isEditing ? (
              <div key={i} className="flex w-full items-center justify-between gap-3 md:w-auto">
                <span className="text-sm font-medium text-[var(--text-color-gray)] md:hidden">
                  {mobileListLabels[i]}
                </span>
                <div className="relative">
                  <input
                    form={formId}
                    type="hidden"
                    name={`${names[i]}_${trabajo.id}`}
                    value={precio ?? 0}
                  />
                  <input
                    type="text"
                    value={formatPrecioInput(precio ?? 0)}
                    inputMode="numeric"
                    onChange={(event) =>
                      onPrecioChange(
                        trabajo.id,
                        (i + 1) as 1 | 2 | 3,
                        parsePrecioInput(event.target.value)
                      )
                    }
                    className="w-28 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-right text-sm font-medium text-[var(--text-color-defult)] transition focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
                  />
                </div>
              </div>
            ) : (
              <div key={i} className="flex w-full items-center justify-between gap-3 md:w-auto">
                <span className="text-sm font-medium text-[var(--text-color-gray)] md:hidden">
                  {mobileListLabels[i]}
                </span>
                <ListPriceBadge
                  lista={(i + 1) as 1 | 2 | 3}
                  value={formatPrecio(precio)}
                  hideLabelOnMobile
                />
              </div>
            )
          )}
        </div>
      </div>

      {isEditing && (
        <div className="hidden md:block">
          <DeleteItemForm
            itemId={trabajo.id}
            idFieldName="trabajoId"
            title="Eliminar trabajo"
            action={deleteTrabajoAction}
          />
        </div>
      )}

    </div>
  );
}

function CategoriaCard({
  grupo,
  deleteCategoriaAction,
  createTrabajoAction,
  deleteTrabajoAction,
  reorderTrabajosAction,
  updateCategoriaAction,
}: {
  grupo: TrabajoAgrupado;
  deleteCategoriaAction: (state: CatalogActionState, formData: FormData) => Promise<CatalogActionState>;
  createTrabajoAction: (state: CatalogActionState, formData: FormData) => Promise<CatalogActionState>;
  deleteTrabajoAction: (state: CatalogActionState, formData: FormData) => Promise<CatalogActionState>;
  reorderTrabajosAction: (orderedIds: number[]) => Promise<void>;
  updateCategoriaAction: (state: CatalogActionState, formData: FormData) => Promise<CatalogActionState>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const lastToastKeyRef = useRef<string | null>(null);
  const deleteFormRef = useRef<HTMLFormElement>(null);
  const [engineIconsOpen, setEngineIconsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ajustesPorcentaje, setAjustesPorcentaje] = useState<Record<1 | 2 | 3, number>>({
    1: 0,
    2: 0,
    3: 0,
  });
  const [categoriaIcono, setCategoriaIcono] = useState<EngineIconName | null>(
    isEngineIconName(grupo.categoriaIcono) ? grupo.categoriaIcono : null
  );
  const [precioDrafts, setPrecioDrafts] = useState<
    Record<number, { precioLista1: number; precioLista2: number; precioLista3: number }>
  >({});

  const [deleteState, deleteFormAction, deletePending] = useActionState(deleteCategoriaAction, { error: null });
  const [addState, addFormAction, addPending] = useActionState(createTrabajoAction, { error: null, resetKey: 0 });
  const [saveState, saveFormAction, savePending] = useActionState(updateCategoriaAction, { error: null });

  useEffect(() => {
    if (saveState.success) setIsEditing(false);
  }, [saveState]);

  useEffect(() => {
    if (!saveState.success) return;

    const toastKey = `precios-saved-${grupo.categoriaId}`;
    if (lastToastKeyRef.current === toastKey) return;
    lastToastKeyRef.current = toastKey;

    toast.success(`Cambios guardados en "${grupo.categoriaNombre}".`);
  }, [saveState.success, grupo.categoriaId, grupo.categoriaNombre]);

  useEffect(() => {
    setPrecioDrafts(
      Object.fromEntries(
        grupo.trabajos.map((trabajo) => [
          trabajo.id,
          {
            precioLista1: trabajo.precioLista1,
            precioLista2: trabajo.precioLista2,
            precioLista3: trabajo.precioLista3,
          },
        ])
      )
    );
    setAjustesPorcentaje({ 1: 0, 2: 0, 3: 0 });
    setCategoriaIcono(isEngineIconName(grupo.categoriaIcono) ? grupo.categoriaIcono : null);
  }, [grupo]);

  const formId = `save-cat-${grupo.categoriaId}`;

  function handleCancel() {
    setIsEditing(false);
    setResetKey((k) => k + 1);
    setCategoriaIcono(isEngineIconName(grupo.categoriaIcono) ? grupo.categoriaIcono : null);
    setPrecioDrafts(
      Object.fromEntries(
        grupo.trabajos.map((trabajo) => [
          trabajo.id,
          {
            precioLista1: trabajo.precioLista1,
            precioLista2: trabajo.precioLista2,
            precioLista3: trabajo.precioLista3,
          },
        ])
      )
    );
    setAjustesPorcentaje({ 1: 0, 2: 0, 3: 0 });
  }

  function handlePrecioChange(trabajoId: number, lista: 1 | 2 | 3, value: number) {
    const precio = Number.isFinite(value) && value >= 0 ? Math.round(value) : 0;

    setPrecioDrafts((prev) => {
      const current = prev[trabajoId] ?? {
        precioLista1: 0,
        precioLista2: 0,
        precioLista3: 0,
      };

      return {
        ...prev,
        [trabajoId]: {
          ...current,
          ...(lista === 1
            ? { precioLista1: precio }
            : lista === 2
              ? { precioLista2: precio }
              : { precioLista3: precio }),
        },
      };
    });
  }

  function applyListaAdjustment(lista: 1 | 2 | 3, delta: number) {
    const newTotal = Math.round((ajustesPorcentaje[lista] + delta) * 10) / 10;
    const factor = 1 + newTotal / 100;

    setPrecioDrafts((prev) => {
      const next = { ...prev };

      for (const trabajo of grupo.trabajos) {
        const current = next[trabajo.id] ?? {
          precioLista1: trabajo.precioLista1,
          precioLista2: trabajo.precioLista2,
          precioLista3: trabajo.precioLista3,
        };

        next[trabajo.id] = {
          ...current,
          ...(lista === 1
            ? { precioLista1: Math.max(0, Math.round(trabajo.precioLista1 * factor)) }
            : lista === 2
              ? { precioLista2: Math.max(0, Math.round(trabajo.precioLista2 * factor)) }
              : { precioLista3: Math.max(0, Math.round(trabajo.precioLista3 * factor)) }),
        };
      }

      return next;
    });

    setAjustesPorcentaje((prev) => ({
      ...prev,
      [lista]: newTotal,
    }));
  }

  return (
    <Card as="section" className=" HeaderTable space-y-0 overflow-hidden !p-0">
      {/* Save form — hidden anchor, inputs reference it via form={formId} */}
      <form id={formId} action={saveFormAction} className="hidden">
        <input type="hidden" name="categoriaId" value={grupo.categoriaId} />
        <input type="hidden" name="icono" value={categoriaIcono ?? ""} />
        <input type="hidden" name="ajuste_lista_1" value={ajustesPorcentaje[1]} />
        <input type="hidden" name="ajuste_lista_2" value={ajustesPorcentaje[2]} />
        <input type="hidden" name="ajuste_lista_3" value={ajustesPorcentaje[3]} />
      </form>

      {/* ── Toolbar ── */}
      {/* ── Toolbar mobile: 2 filas / desktop: 1 fila ── */}
      <div className="toolbar flex flex-col border-b border-[var(--color-border)] bg-[var(--color-surface-alt)] md:flex-row md:items-center sm:gap-2 sm:px-8 sm:py-5">

        {/* Fila 1 (mobile) / izquierda (desktop): ícono + nombre + contador */}
        <div className="flex items-center gap-2 px-3 py-2 md:min-w-0 md:flex-1 md:p-0">
          {isEditing ? (
            <button
              type="button"
              onClick={() => setEngineIconsOpen(true)}
              title={categoriaIcono ? "Cambiar imagen" : "Asignar imagen"}
              className="h-8 w-8 shrink-0 rounded-lg border border-dashed border-[var(--color-border)] flex items-center justify-center text-[var(--text-color-gray)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              {categoriaIcono ? (
                <EngineIconGlyph name={categoriaIcono} className="h-8 w-8 text-[var(--text-color-defult)]" />
              ) : (
                <Icon name="plus" className="h-3.5 w-3.5" />
              )}
            </button>
          ) : categoriaIcono ? (
            <EngineIconGlyph name={categoriaIcono} className="h-8 w-8 shrink-0 text-[var(--text-color-defult)]" />
          ) : (
            <Icon name="tag" className="h-4 w-4 shrink-0 text-[var(--color-accent)]" />
          )}
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
            <span className="flex-1 text-sm font-semibold uppercase tracking-widest text-[var(--text-color-defult)]">
              {grupo.categoriaNombre}
            </span>
          )}
          <span className="hidden md:flex shrink-0 rounded-full bg-[var(--color-border)] px-2 py-0.5 text-xs font-medium text-[var(--text-color-gray)]">
            {grupo.trabajos.length} {grupo.trabajos.length === 1 ? "trabajo" : "trabajos"}
          </span>
        </div>

        {/* Fila 2 (mobile) / derecha (desktop): acciones */}
        <div className="flex items-center gap-1.5 border-t border-[var(--color-border)] px-3 py-2 md:shrink-0 md:border-t-0 md:p-0">
          {isEditing ? (
            <>
              <PulsatingButton
                form={formId}
                type="submit"
                size="sm"
                pulsing={!savePending}
                disabled={savePending}
                className="flex items-center gap-1.5 rounded-lg bg-[var(--color-success-text)] text-xs font-semibold text-white transition hover:bg-[var(--color-success-text-strong)] disabled:opacity-60"
              >
                {savePending ? <Spinner className="h-3.5 w-3.5" /> : <Icon name="check" className="h-3.5 w-3.5" />}
                {savePending ? "Guardando…" : "Guardar"}
              </PulsatingButton>
              <Button
                type="button"
                size="sm"
                variant="outline-dark"
                onClick={handleCancel}
                icon={<Icon name="x" className="h-3.5 w-3.5" />}
              >
                Cancelar
              </Button>
              <form ref={deleteFormRef} action={deleteFormAction}>
                <input type="hidden" name="categoriaId" value={grupo.categoriaId} />
                <Button
                  type="button"
                  variant="ghost"
                  disabled={deletePending}
                  title="Eliminar categoría"
                  className="rounded-lg p-1.5 text-[var(--text-color-gray)] transition hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger-text)] disabled:opacity-40"
                  onClick={() => setDeleteDialogOpen(true)}
                  icon={<Icon name="trash" className="h-4 w-4" />}
                />
              </form>
              <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="¿Eliminar categoría?"
                description={`Vas a eliminar "${grupo.categoriaNombre}" y todos sus trabajos. Esta acción no se puede deshacer.`}
                confirmLabel="Eliminar categoría"
                loading={deletePending}
                onConfirm={() => {
                  setDeleteDialogOpen(false);
                  deleteFormRef.current?.requestSubmit();
                }}
              />
            </>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(true)}
              icon={<Icon name="edit" className="h-3.5 w-3.5" />}
            >
              Editar categoría
            </Button>
          )}
        </div>
      </div>

      {/* Errores */}
      {(deleteState.error || saveState.error) && (
        <p className="px-5 py-2 text-xs text-[var(--color-danger-text)]">
          {deleteState.error ?? saveState.error}
        </p>
      )}

      {/* ── Trabajos ── */}
      {grupo.trabajos.length === 0 ? (
        <p className="px-5 py-4 text-sm text-[var(--text-color-gray)]">
          Sin trabajos. Agregá uno abajo.
        </p>
      ) : (
        <SortableList
          key={resetKey}
          items={grupo.trabajos}
          dndId={`dnd-cat-${grupo.categoriaId}`}
          onReorder={reorderTrabajosAction}
          renderHeader={
            isEditing ? (
              <div className="adjust-values flex flex-col gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface-alt)] px-5 py-2 md:flex-row md:items-center md:gap-3 md:py-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-color-gray)] md:flex-1">
                  Ajuste porcentual por lista
                </span>
                <div className="flex flex-wrap gap-3 md:shrink-0 md:flex-nowrap md:gap-2">
                  {[1, 2, 3].map((lista) => (
                    <div key={lista} className="flex items-center gap-2 md:w-28 md:flex-col md:gap-1">
                      <span className="w-14 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-color-gray)] md:w-auto md:text-center">
                        Lista {lista}
                      </span>
                      <Incrementor
                        incrementoSmall
                        value={ajustesPorcentaje[lista as 1 | 2 | 3]}
                        onDecrement={() => applyListaAdjustment(lista as 1 | 2 | 3, -0.1)}
                        onIncrement={() => applyListaAdjustment(lista as 1 | 2 | 3, 0.1)}
                        valueClassName="min-w-0"
                        formatValue={(value) => `${value > 0 ? "+" : ""}${value.toFixed(1)}%`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          }
          renderItem={(trabajo, index) => (
            <SortableTrabajoRow
              key={trabajo.id}
              trabajo={trabajo}
              index={index}
              isEditing={isEditing}
              formId={formId}
              preciosDraft={precioDrafts[trabajo.id]}
              onPrecioChange={handlePrecioChange}
              deleteTrabajoAction={deleteTrabajoAction}
            />
          )}
        />
      )}

      {/* ── Footer: agregar trabajo — solo en modo edición ── */}
      {isEditing && <div className="flex flex-wrap items-center gap-3 bg-[var(--color-info-bg)] px-5 py-3" style={{ borderTop: "2px dashed var(--color-info-border-strong)" }}>
        <form
          key={addState.resetKey ?? 0}
          action={addFormAction}
          className="flex flex-col md:flex-row flex-1 items-center gap-3"
        >
          <input type="hidden" name="categoriaId" value={grupo.categoriaId} />
          <input
            type="text"
            name="nombre"
            placeholder="Nombre del nuevo trabajo…"
            required
            className="flex-1 w-full md:w-auto rounded-xl border border-[var(--color-info-border)] bg-white/80 px-3 py-1.5 text-sm text-[var(--text-color-defult)] placeholder:text-[var(--color-info-border-strong)] focus:border-[var(--color-info-border-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--color-info-border)]/40 backdrop-blur-sm"
          />
          <button
            type="submit"
            disabled={addPending}
            className={buttonStyles({ className: "gap-2 w-full md:w-auto !text-white bg-[var(--color-info-text)] uppercase hover:bg-[var(--color-info-text-strong)]" })}
          >
            {addPending ? <Spinner className="h-4 w-4" /> : <Icon name="plus" className="h-4 w-4" />}
            {addPending ? "Agregando…" : "Agregar trabajo"}
          </button>
          {addState.error && (
            <p className="text-xs text-[var(--color-danger-text)]">{addState.error}</p>
          )}
        </form>
      </div>}

      <EngineIcons
        open={engineIconsOpen}
        onOpenChange={setEngineIconsOpen}
        value={categoriaIcono}
        onSelect={setCategoriaIcono}
      />
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
      <form key={state.resetKey ?? 0} action={formAction} className="flex gap-3 rounded-[18px] bg-[var(--color-info-bg)] px-4 py-3" style={{ border: "2px dashed var(--color-info-border-strong)" }}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre de la nueva categoría…"
          required
          className="flex-1 rounded-xl border border-[var(--color-info-border)] bg-white/80 px-4 py-2 text-sm text-[var(--text-color-defult)] placeholder:text-[var(--color-info-border-strong)] focus:border-[var(--color-info-border-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--color-info-border)]/40"
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
      {state.error && (
        <p className="text-sm text-[var(--color-danger-text)]">{state.error}</p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type PreciosPageProps = {
  trabajos: TrabajoAgrupado[];
  createCategoriaAction: (state: CatalogActionState, formData: FormData) => Promise<CatalogActionState>;
  deleteCategoriaAction: (state: CatalogActionState, formData: FormData) => Promise<CatalogActionState>;
  createTrabajoAction: (state: CatalogActionState, formData: FormData) => Promise<CatalogActionState>;
  deleteTrabajoAction: (state: CatalogActionState, formData: FormData) => Promise<CatalogActionState>;
  reorderTrabajosAction: (orderedIds: number[]) => Promise<void>;
  updateCategoriaAction: (state: CatalogActionState, formData: FormData) => Promise<CatalogActionState>;
};

export function PreciosPage({
  trabajos,
  createCategoriaAction,
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
