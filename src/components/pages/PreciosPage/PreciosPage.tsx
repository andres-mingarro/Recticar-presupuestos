"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AddCategoriaForm } from "@/components/forms/AddCategoriaForm";
import type { TrabajoAgrupado } from "@/lib/types";
import type { CatalogActionState } from "@/app/(app)/precios/actions";
import { cn } from "@/lib/cn";
import { LISTAS_PRECIOS, type ListaPrecio, type PreciosLista } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { DeleteItemForm } from "@/components/forms/DeleteItemForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button, buttonStyles } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EngineIcons, EngineIconGlyph, isEngineIconName, type EngineIconName } from "@/components/ui/EngineIcons";
import { Icon } from "@/components/ui/Icon";
import { SortableList } from "@/components/sortable/SortableList";
import { Spinner } from "@/components/ui/Spinner";
import { DragHandle } from "@/components/ui/DragHandle";
import { notifySuccess, useErrorNotification } from "@/components/ui/NotificationToast";
import { PulsatingButton } from "@/components/ui/PulsatingButton";
import { Incrementor } from "@/components/ui/Incrementor";
import { PdfShareButton } from "@/components/ui/PdfShareButton";
import { ShimmerHighlight } from "@/components/ui/ShimmerHighlight";
import {
  mergeReadableRowTransition,
  readableRowGroupCls,
  readableRowGroupPanelCls,
  readableRowHoverCls,
} from "@/components/ui/readableRowHover";

// ─── Category card ────────────────────────────────────────────────────────────

type Trabajo = TrabajoAgrupado["trabajos"][number];

const emptyAjustes = (): Record<ListaPrecio, number> =>
  Object.fromEntries(LISTAS_PRECIOS.map((n) => [n, 0])) as Record<ListaPrecio, number>;

const emptyPrecios = (): PreciosLista =>
  Object.fromEntries(LISTAS_PRECIOS.map((n) => [`precioLista${n}`, 0])) as PreciosLista;

const extractPrecios = (t: PreciosLista): PreciosLista =>
  Object.fromEntries(LISTAS_PRECIOS.map((n) => [`precioLista${n}`, t[`precioLista${n}`]])) as PreciosLista;

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


function SortableTrabajoRow({
  trabajo,
  isEditing,
  formId,
  preciosDraft,
  onPrecioChange,
  deleteTrabajoAction,
}: {
  trabajo: Trabajo;
  isEditing: boolean;
  formId: string;
  preciosDraft?: PreciosLista;
  onPrecioChange: (trabajoId: number, lista: ListaPrecio, value: number) => void;
  deleteTrabajoAction: (state: CatalogActionState, formData: FormData) => Promise<CatalogActionState>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: trabajo.id });

  const style = { transform: CSS.Transform.toString(transform), transition: mergeReadableRowTransition(transition) };
  const precios = LISTAS_PRECIOS.map((n) => preciosDraft?.[`precioLista${n}`] ?? trabajo[`precioLista${n}`]);
  const names = LISTAS_PRECIOS.map((n) => `precio_lista_${n}`);
  const mobileListLabels = LISTAS_PRECIOS.map((n) => `Precios lista ${n}`);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "SortableTrabajoRow precios-item-row relative border-b-2 md:border-b-0 border-b-[var(--orange-vivid)] last:border-b-0 flex flex-col border-b border-[var(--color-border)]/80 md:flex-row md:items-stretch",
        readableRowGroupCls,
        readableRowHoverCls,
        isDragging && "z-10 rounded-xl bg-white opacity-90 shadow-lg"
      )}
    >
      <div className={cn(
        "precios-item-row-header bg-[var(--gray-30)] md:bg-transparent border-b-[var(--orange-vivid)] flex flex-1 items-start gap-2 px-4 md:p-3 md:items-center md:group-hover/readable-row:bg-transparent md:group-focus-within/readable-row:bg-transparent",
        readableRowGroupPanelCls
      )}>
        {isEditing && (
          <div className="mt-1 md:mt-0">
            <DragHandle {...attributes} {...listeners} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          {/* nombre del  */}
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
                : "border border-transparent bg-transparent text-[15px] font-medium leading-6 md:text-sm"
            )}
          />
          {!isEditing && (
            <p className="mt-0.5 pl-2 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-[var(--text-color-gray)] md:hidden">
              Valores por lista
            </p>
          )}
        </div>
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

      <div className={cn(
        "precios-item-row-footer md:hidden border-t border-[var(--color-border)]/50 bg-[var(--color-surface-alt)]/20 px-4 py-2",
        readableRowGroupPanelCls
      )}>
        <div className="divide-y divide-[var(--color-border)]/50">
          {precios.map((precio, i) =>
            isEditing ? (
              <div key={i} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <span className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[var(--text-color-gray)]">
                  {mobileListLabels[i]}
                </span>
                <div className="w-[132px]">
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
                        (i + 1) as ListaPrecio,
                        parsePrecioInput(event.target.value)
                      )
                    }
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-right text-sm font-medium tabular-nums text-[var(--text-color-defult)] transition focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
                  />
                </div>
              </div>
            ) : (
              <div key={i} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <span className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[var(--text-color-gray)]">
                  {mobileListLabels[i]}
                </span>
                <span className="tabular-nums text-[15px] font-semibold text-right text-[var(--text-color-defult)]">
                  {formatPrecio(precio)}
                </span>
              </div>
            )
          )}
        </div>
      </div>

      <div className="hidden md:flex precios-item-row-footer md:flex-row items-end md:items-stretch gap-2 md:gap-0">
        {precios.map((precio, i) =>
          isEditing ? (
            <div
              key={i}
              className={cn(
                "flex w-full items-center justify-between gap-3 md:w-28 md:flex-col md:justify-center md:items-center",
                i % 2 === 1 && "md:bg-black/[0.03]"
              )}
            >
              <span className="text-sm font-medium text-[var(--text-color-gray)] md:hidden">
                {mobileListLabels[i]}
              </span>
              <div className="relative px-1 ">
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
                      (i + 1) as ListaPrecio,
                      parsePrecioInput(event.target.value)
                    )
                  }
                  className="w-28 md:w-25 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-right text-sm font-medium text-[var(--text-color-defult)] transition focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
                />
              </div>
            </div>
          ) : (
            <div
              key={i}
              className={cn(
                "flex w-full items-center justify-between gap-3 md:w-28 md:justify-end md:items-center md:px-3",
                i % 2 === 1 && "md:bg-black/[0.03]"
              )}
            >
              <span className="text-sm font-medium text-[var(--text-color-gray)] md:hidden">
                {mobileListLabels[i]}
              </span>
              <span className="tabular-nums text-sm font-medium text-right text-[var(--text-color-defult)]">
                {formatPrecio(precio)}
              </span>
            </div>
          )
        )}
      </div>
      <div className="hidden w-[70] items-center justify-center md:flex">
        {isEditing && (
          <DeleteItemForm
            itemId={trabajo.id}
            idFieldName="trabajoId"
            title="Eliminar trabajo"
            action={deleteTrabajoAction}
          />
        )}
      </div>
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
  onHighlightDismiss,
}: {
  grupo: TrabajoAgrupado;
  deleteCategoriaAction: (state: CatalogActionState, formData: FormData) => Promise<CatalogActionState>;
  createTrabajoAction: (state: CatalogActionState, formData: FormData) => Promise<CatalogActionState>;
  deleteTrabajoAction: (state: CatalogActionState, formData: FormData) => Promise<CatalogActionState>;
  reorderTrabajosAction: (orderedIds: number[]) => Promise<void>;
  updateCategoriaAction: (state: CatalogActionState, formData: FormData) => Promise<CatalogActionState>;
  onHighlightDismiss?: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const lastToastKeyRef = useRef<string | null>(null);
  const [engineIconsOpen, setEngineIconsOpen] = useState(false);
  const [ajustesPorcentaje, setAjustesPorcentaje] = useState<Record<ListaPrecio, number>>(emptyAjustes);
  const [categoriaIcono, setCategoriaIcono] = useState<EngineIconName | null>(
    isEngineIconName(grupo.categoriaIcono) ? grupo.categoriaIcono : null
  );
  const [precioDrafts, setPrecioDrafts] = useState<Record<number, PreciosLista>>({});

  const [addState, addFormAction, addPending] = useActionState(createTrabajoAction, { error: null, resetKey: 0 });
  const [saveState, saveFormAction, savePending] = useActionState(updateCategoriaAction, { error: null });
  useErrorNotification(addState.error, addState.resetKey);
  useErrorNotification(saveState.error, grupo.categoriaId);

  useEffect(() => {
    if (saveState.success) setIsEditing(false);
  }, [saveState]);

  useEffect(() => {
    if (!saveState.success) return;

    const toastKey = `precios-saved-${grupo.categoriaId}`;
    if (lastToastKeyRef.current === toastKey) return;
    lastToastKeyRef.current = toastKey;

    notifySuccess(`Cambios guardados en "${grupo.categoriaNombre}".`);
  }, [saveState.success, grupo.categoriaId, grupo.categoriaNombre]);

  useEffect(() => {
    setPrecioDrafts(Object.fromEntries(grupo.trabajos.map((t) => [t.id, extractPrecios(t)])));
    setAjustesPorcentaje(emptyAjustes());
    setCategoriaIcono(isEngineIconName(grupo.categoriaIcono) ? grupo.categoriaIcono : null);
  }, [grupo]);

  const formId = `save-cat-${grupo.categoriaId}`;

  function handleCancel() {
    setIsEditing(false);
    setResetKey((k) => k + 1);
    setCategoriaIcono(isEngineIconName(grupo.categoriaIcono) ? grupo.categoriaIcono : null);
    setPrecioDrafts(Object.fromEntries(grupo.trabajos.map((t) => [t.id, extractPrecios(t)])));
    setAjustesPorcentaje(emptyAjustes());
  }

  function handlePrecioChange(trabajoId: number, lista: ListaPrecio, value: number) {
    const precio = Number.isFinite(value) && value >= 0 ? Math.round(value) : 0;
    const key = `precioLista${lista}` as keyof PreciosLista;

    setPrecioDrafts((prev) => ({
      ...prev,
      [trabajoId]: { ...(prev[trabajoId] ?? emptyPrecios()), [key]: precio },
    }));
  }

  function applyListaAdjustment(lista: ListaPrecio, delta: number) {
    const newTotal = Math.round((ajustesPorcentaje[lista] + delta) * 10) / 10;
    const factor = 1 + newTotal / 100;
    const key = `precioLista${lista}` as keyof PreciosLista;

    setPrecioDrafts((prev) => {
      const next = { ...prev };

      for (const trabajo of grupo.trabajos) {
        const current = next[trabajo.id] ?? extractPrecios(trabajo);
        next[trabajo.id] = { ...current, [key]: Math.max(0, Math.round(trabajo[key] * factor)) };
      }

      return next;
    });

    setAjustesPorcentaje((prev) => ({
      ...prev,
      [lista]: newTotal,
    }));
  }

  return (
    <Card noPadding as="section" className=" HeaderTable space-y-0 overflow-hidden">
      {/* Save form — hidden anchor, inputs reference it via form={formId} */}
      <form id={formId} action={saveFormAction} className="hidden">
        <input type="hidden" name="categoriaId" value={grupo.categoriaId} />
        <input type="hidden" name="icono" value={categoriaIcono ?? ""} />
        {LISTAS_PRECIOS.map((n) => (
          <input key={n} type="hidden" name={`ajuste_lista_${n}`} value={ajustesPorcentaje[n]} />
        ))}
      </form>

      {/* ── Toolbar ── */}
      {/* ── Toolbar mobile: 2 filas / desktop: 1 fila ── */}
      <div className="toolbar flex flex-col justify-center md:flex-row md:items-center sm:gap-2 border-b border-[var(--color-border)]  bg-[var(--gray-40)] pt-2 md:px-8 md:py-5">

        {/* Fila 1 (mobile) / izquierda (desktop): ícono + nombre + contador */}
        <div className="flex items-center gap-2 px-3 py-2 md:min-w-0 md:flex-1 md:p-0">
          {isEditing ? (
            <button
              type="button"
              onClick={() => setEngineIconsOpen(true)}
              title={categoriaIcono ? "Cambiar imagen" : "Asignar imagen"}
              className="size-8 shrink-0 rounded-lg border border-dashed border-[var(--color-border)] flex items-center justify-center text-[var(--text-color-gray)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              {categoriaIcono ? (
                <EngineIconGlyph name={categoriaIcono} className="size-8 text-[var(--text-color-defult)]" />
              ) : (
                <Icon name="plus" className="size-3.5" />
              )}
            </button>
          ) : categoriaIcono ? (
            <EngineIconGlyph name={categoriaIcono} className="size-8 shrink-0 text-[var(--text-color-defult)]" />
          ) : (
            <Icon name="tag" className="size-4 shrink-0 text-[var(--color-accent)]" />
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
                className="flex flex-1 items-center gap-1.5 rounded-lg bg-[var(--color-success-text)] text-xs font-semibold text-white transition hover:bg-[var(--color-success-text-strong)] disabled:opacity-60"
              >
                {savePending ? <Spinner className="size-3.5" /> : <Icon name="check" className="size-3.5" />}
                {savePending ? "Guardando…" : "Guardar"}
              </PulsatingButton>
              <Button
                type="button"
                size="sm"
                variant="outline-dark"
                onClick={handleCancel}
                icon={<Icon name="x" className="size-3.5" />}
              >
                Cancelar
              </Button>
              <DeleteItemForm
                itemId={grupo.categoriaId}
                idFieldName="categoriaId"
                title="Eliminar categoría"
                confirmDescription={`Se eliminarán todos los trabajos de "${grupo.categoriaNombre}". Esta acción no se puede deshacer.`}
                doubleConfirm
                doubleConfirmDescription={`Esta acción borrará la categoría "${grupo.categoriaNombre}" y todos sus trabajos. No se puede deshacer.`}
                action={deleteCategoriaAction}
              />
            </>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="dark"
              className="w-full md:w-auto"
              onClick={() => {
                onHighlightDismiss?.();
                setIsEditing(true);
              }}
              icon={<Icon name="edit" className="size-3.5" />}
            >
              Editar categoría
            </Button>
          )}
        </div>
      </div>

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
              <div className="adjust-values flex flex-col border-b border-[var(--color-border)] bg-[var(--color-surface-alt)] md:flex-row md:items-stretch">
                <span className="flex items-center px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-color-gray)] md:flex-1 md:py-0">
                  Ajuste porcentual por lista
                </span>
                <div className="flex flex-wrap gap-3 px-5 pb-2 md:shrink-0 md:flex-nowrap md:gap-0 md:px-0 md:py-0">
                  {LISTAS_PRECIOS.map((n, i) => (
                    <div key={n} className={cn("flex w-full items-center justify-between gap-3 md:w-28 md:flex-col md:justify-center md:items-center md:py-2", i % 2 === 1 && "md:bg-black/[0.03]")}>
                      <span className="w-14 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-color-gray)] md:w-auto md:text-center">
                        Lista {n}
                      </span>
                      <Incrementor
                        incrementoSmall
                        value={ajustesPorcentaje[n]}
                        onDecrement={() => applyListaAdjustment(n, -0.1)}
                        onIncrement={() => applyListaAdjustment(n, 0.1)}
                        valueClassName="min-w-0"
                        formatValue={(value) => `${value > 0 ? "+" : ""}${value.toFixed(1)}%`}
                      />
                    </div>
                  ))}
                </div>
                <div className="w-[70] flex items-center justify-center"></div>
              </div>
            ) : (
              <div className="hidden md:flex items-stretch border-b border-[var(--color-border)] bg-[var(--color-surface-alt)]/40">
                <div className="flex-1 px-5 py-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-color-gray)]">Trabajo</span>
                </div>
                <div className="flex shrink-0">
                  {LISTAS_PRECIOS.map((n, i) => (
                    <div key={n} className={cn("w-28 px-1 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-[var(--text-color-gray)]", i % 2 === 1 && "bg-black/[0.03]")}>
                      Lista {n}
                    </div>
                  ))}
                </div>
                <div className="w-[70] flex items-center justify-center"></div>
              </div>
            )
          }
          renderItem={(trabajo) => (
            <SortableTrabajoRow
              key={trabajo.id}
              trabajo={trabajo}
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
            {addPending ? <Spinner className="size-4" /> : <Icon name="plus" className="size-4" />}
            {addPending ? "Agregando…" : "Agregar trabajo"}
          </button>
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
  const [highlightedCategoriaId, setHighlightedCategoriaId] = useState<number | null>(null);

  return (
    <div className="PreciosPage space-y-6">
      <PageHeader
        eyebrow="Configuración"
        title="Lista de precios"
        description={`${totalTrabajos} trabajos en ${trabajos.length} categorías.`}
        actions={
          <PdfShareButton
            href="/api/precios/pdf"
            filename="lista-de-precios.pdf"
            variant="warm"
            size="md"
          >
            Descargar PDF
          </PdfShareButton>
        }
      />

      <div className="space-y-4">
        {trabajos.map((grupo) => {
          const highlighted = highlightedCategoriaId === grupo.categoriaId;

          return (
            <ShimmerHighlight key={grupo.categoriaId} active={highlighted}>
              <CategoriaCard
                grupo={grupo}
                deleteCategoriaAction={deleteCategoriaAction}
                createTrabajoAction={createTrabajoAction}
                deleteTrabajoAction={deleteTrabajoAction}
                reorderTrabajosAction={reorderTrabajosAction}
                updateCategoriaAction={updateCategoriaAction}
                onHighlightDismiss={() => setHighlightedCategoriaId(null)}
              />
            </ShimmerHighlight>
          );
        })}
      </div>

      <AddCategoriaForm
        action={createCategoriaAction}
        onCreatedCategoria={setHighlightedCategoriaId}
      />
    </div>
  );
}
