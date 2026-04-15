"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import type { TechnicalActionState } from "@/app/(app)/informacion-tecnica/actions";
import { cn } from "@/lib/cn";
import type {
  TechnicalMarca,
  TechnicalModelo,
  TechnicalMotor,
  TechnicalVehiculo,
} from "@/lib/types";
import type { TechnicalSection } from "@/lib/queries/informacion-tecnica";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { Icon } from "@/components/ui/Icon";
import { buttonStyles } from "@/components/ui/Button";
import { ButtonGroup } from "@/components/ui/ButtonGroup";
import { Spinner } from "@/components/ui/Spinner";
import { PulsatingButton } from "@/components/ui/PulsatingButton";
import styles from "./InformacionTecnicaPage.module.scss";

type ActionFn = (
  state: TechnicalActionState,
  formData: FormData
) => Promise<TechnicalActionState>;

const SECTION_LABELS: Record<TechnicalSection, string> = {
  marcas: "Marcas",
  modelos: "Modelos",
  motores: "Motores",
  vehiculos: "Vehículos",
};

const SECTION_ICONS = {
  marcas: "tag",
  modelos: "clipboard",
  motores: "gauge",
  vehiculos: "car",
} as const;

function buildSectionHref(section: TechnicalSection, q: string, page = 1) {
  const params = new URLSearchParams();
  params.set("section", section);
  if (q) params.set("q", q);
  if (page > 1) params.set("page", String(page));
  return `/informacion-tecnica?${params.toString()}`;
}

// ─── Field class helpers ──────────────────────────────────────────────────────

const fieldCls =
  "rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5 text-sm text-[var(--color-foreground)] transition focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 disabled:opacity-60";

const readCls =
  "px-2 py-1.5 text-sm font-medium text-[var(--color-foreground)]";

const addFieldCls =
  "rounded-xl border border-[var(--color-info-border)] bg-white/80 px-3 py-1.5 text-sm placeholder:text-[var(--color-info-border-strong)] focus:border-[var(--color-info-border-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--color-info-border)]/40";

const saveRowBtnCls =
  "shrink-0 whitespace-nowrap rounded-lg border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-foreground-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-40";

// ─── Section tabs ─────────────────────────────────────────────────────────────

function SectionTabs({
  activeSection,
  q,
  sectionCounts,
}: {
  activeSection: TechnicalSection;
  q: string;
  sectionCounts: Record<TechnicalSection, number>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(SECTION_LABELS) as TechnicalSection[]).map((section) => {
        const active = section === activeSection;
        return (
          <Link
            key={section}
            href={buildSectionHref(section, q)}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition",
              active
                ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                : "border-[var(--color-border)] bg-white text-[var(--color-foreground-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            )}
          >
            <Icon name={SECTION_ICONS[section]} className="h-4 w-4 shrink-0" />
            <span>{SECTION_LABELS[section]}</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs",
                active
                  ? "bg-white/20 text-white"
                  : "bg-[var(--color-surface-alt)] text-[var(--color-foreground)]"
              )}
            >
              {sectionCounts[section]}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

// ─── Content card (toolbar + rows + footer) ───────────────────────────────────

function ContentCard({
  section,
  count,
  q,
  currentPage,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  pageStart,
  pageEnd,
  totalItems,
  columnHeaders,
  createForm,
  emptyLabel,
  children,
  tabsSlot,
}: {
  section: TechnicalSection;
  count: number;
  q: string;
  currentPage: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  pageStart: number;
  pageEnd: number;
  totalItems: number;
  columnHeaders?: React.ReactNode;
  createForm?: React.ReactNode;
  emptyLabel: string;
  children: React.ReactNode;
  tabsSlot?: React.ReactNode;
}) {
  return (
    <Card as="section" className="overflow-hidden p-0">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2">
        <Icon name="tag" className="h-4 w-4 shrink-0 text-[var(--color-accent)]" />
        <span className="text-sm font-semibold uppercase tracking-widest text-[var(--color-foreground)]">
          {SECTION_LABELS[section]}
        </span>
        <span className="shrink-0 rounded-full bg-[var(--color-border)] px-2 py-0.5 text-xs font-medium text-[var(--color-foreground-muted)]">
          {count}
        </span>

        {tabsSlot && (
          <>
            <Divider orientation="vertical" className="h-5" />
            {tabsSlot}
          </>
        )}

        <Divider orientation="vertical" className="h-5" />

        {/* Search */}
        <form className="flex min-w-0 flex-1 items-center gap-1.5">
          <input type="hidden" name="section" value={section} />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder={`Buscar en ${SECTION_LABELS[section].toLowerCase()}…`}
            className="min-w-0 flex-1 rounded-lg border border-[var(--color-border)] bg-white px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
          />
          <button type="submit" className={buttonStyles({ className: "shrink-0" })}>
            <Icon name="search" className="h-4 w-4" />
            Buscar
          </button>
          {q && (
            <Link
              href={buildSectionHref(section, "")}
              className={buttonStyles({ variant: "secondary", className: "shrink-0" })}
            >
              <Icon name="x" className="h-4 w-4" />
              Limpiar
            </Link>
          )}
        </form>

        {(totalPages > 1 || currentPage > 1) && (
          <>
            <Divider orientation="vertical" className="h-5" />
            <div className="flex shrink-0 items-center gap-1.5">
              {hasPreviousPage ? (
                <Link
                  href={buildSectionHref(section, q, currentPage - 1)}
                  className="rounded-lg border border-[var(--color-border)] bg-white p-1.5 text-[var(--color-foreground-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  <Icon name="chevronLeft" className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <span className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-1.5 text-[var(--color-foreground-muted)] opacity-40">
                  <Icon name="chevronLeft" className="h-3.5 w-3.5" />
                </span>
              )}
              <span className="text-xs text-[var(--color-foreground-muted)]">
                {totalItems === 0 ? "0" : `${pageStart}–${pageEnd}`}
                <span className="mx-1 opacity-40">/</span>
                {totalItems}
              </span>
              {hasNextPage ? (
                <Link
                  href={buildSectionHref(section, q, currentPage + 1)}
                  className="rounded-lg border border-[var(--color-border)] bg-white p-1.5 text-[var(--color-foreground-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  <Icon name="chevronRight" className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <span className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-1.5 text-[var(--color-foreground-muted)] opacity-40">
                  <Icon name="chevronRight" className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Column headers ── */}
      {columnHeaders && (
        <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-1.5">
          {columnHeaders}
        </div>
      )}

      {/* ── Rows ── */}
      {totalItems === 0 ? (
        <p className="px-4 py-4 text-sm text-[var(--color-foreground-muted)]">{emptyLabel}</p>
      ) : (
        <div>{children}</div>
      )}

      {/* ── Add form footer ── */}
      {createForm}
    </Card>
  );
}

// ─── Row delete button ────────────────────────────────────────────────────────

function DeleteButton({ form, disabled }: { form: string; disabled?: boolean }) {
  return (
    <button
      type="submit"
      form={form}
      disabled={disabled}
      title="Eliminar"
      className="shrink-0 rounded-lg p-1.5 text-[var(--color-foreground-muted)] transition hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger-text)] disabled:opacity-40"
    >
      <Icon name="trash" className="h-4 w-4" />
    </button>
  );
}

function RowError({ error }: { error: string | null | undefined }) {
  if (!error) return null;
  return (
    <p className="pb-2 pl-4 text-xs text-[var(--color-danger-text)]">{error}</p>
  );
}

// ─── Rows ─────────────────────────────────────────────────────────────────────

function MarcaRow({
  marca,
  index,
  updateAction,
  deleteAction,
  canEdit,
  hiddenMarcas,
  confirmMarcaHiddenChange,
}: {
  marca: TechnicalMarca;
  index: number;
  updateAction: ActionFn;
  deleteAction: ActionFn;
  canEdit: boolean;
  hiddenMarcas: Set<number>;
  confirmMarcaHiddenChange: (marcaId: number, hidden: boolean) => void;
}) {
  const deleteFormId = `delete-marca-${marca.id}`;
  const [state, formAction, isPending] = useActionState(updateAction, { error: null });
  const [deleteState, deleteFormAction, deletePending] = useActionState(deleteAction, { error: null });
  const isHidden = hiddenMarcas.has(marca.id);
  const [pendingHidden, setPendingHidden] = useState(isHidden);
  const prevPending = useRef(isPending);

  useEffect(() => {
    setPendingHidden(isHidden);
  }, [isHidden]);

  useEffect(() => {
    if (prevPending.current && !isPending && !state.error && pendingHidden !== isHidden) {
      confirmMarcaHiddenChange(marca.id, pendingHidden);
    }
    prevPending.current = isPending;
  }, [isPending, state.error, pendingHidden, isHidden, confirmMarcaHiddenChange, marca.id]);

  return (
    <div className={cn(index % 2 === 1 && "bg-[var(--color-surface-alt)]/40")}>
      <form
        action={canEdit ? formAction : undefined}
        className="flex items-center gap-2 px-4 py-2.5"
      >
        <input type="hidden" name="marcaId" value={marca.id} />
        <input type="hidden" name="hidden" value={pendingHidden ? "1" : "0"} />
        <button
          type="button"
          onClick={() => setPendingHidden((prev) => !prev)}
          disabled={!canEdit}
          className={cn(
            "shrink-0 rounded-full border border-[var(--color-border)] p-1.5 text-[var(--color-foreground-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]",
            !canEdit && "opacity-40"
          )}
          title={canEdit ? (pendingHidden ? "Ocultar marca (guardar para confirmar)" : "Mostrar marca (guardar para confirmar)") : "Necesitás permisos para guardar"}
        >
          <Icon name={pendingHidden ? "eyeSlash" : "eye"} className="h-4 w-4" />
        </button>
        <input
          type="text"
          name="nombre"
          defaultValue={marca.nombre}
          disabled={!canEdit || isPending}
          className={cn("min-w-0 flex-1", canEdit ? fieldCls : readCls)}
        />
        {canEdit && (
          <>
            <PulsatingButton type="submit" pulsing={!isPending} disabled={isPending} className={cn(saveRowBtnCls, "inline-flex items-center gap-1.5")}>
              {isPending ? <Spinner className="h-3.5 w-3.5" /> : null}
              {isPending ? "Guardando…" : "Guardar"}
            </PulsatingButton>
            <DeleteButton form={deleteFormId} disabled={deletePending} />
          </>
        )}
      </form>
      <form id={deleteFormId} action={deleteFormAction} className="hidden">
        <input type="hidden" name="marcaId" value={marca.id} />
      </form>
      <RowError error={state.error ?? deleteState.error} />
    </div>
  );
}

function ModeloRow({
  modelo,
  index,
  marcas,
  updateAction,
  deleteAction,
  canEdit,
}: {
  modelo: TechnicalModelo;
  index: number;
  marcas: TechnicalMarca[];
  updateAction: ActionFn;
  deleteAction: ActionFn;
  canEdit: boolean;
}) {
  const deleteFormId = `delete-modelo-${modelo.id}`;
  const [state, formAction, isPending] = useActionState(updateAction, { error: null });
  const [deleteState, deleteFormAction, deletePending] = useActionState(deleteAction, { error: null });

  return (
    <div className={cn(index % 2 === 1 && "bg-[var(--color-surface-alt)]/40")}>
      <form
        action={canEdit ? formAction : undefined}
        className="grid items-center gap-2 px-4 py-2.5 md:grid-cols-[1fr_180px_auto_auto]"
      >
        <input type="hidden" name="modeloId" value={modelo.id} />
        {canEdit ? (
          <>
            <input
              type="text"
              name="nombre"
              defaultValue={modelo.nombre}
              disabled={isPending}
              className={cn("min-w-0", fieldCls)}
            />
            <select
              name="marcaId"
              defaultValue={modelo.marcaId}
              disabled={isPending}
              className={fieldCls}
            >
              {marcas.map((m) => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
            <PulsatingButton type="submit" pulsing={!isPending} disabled={isPending} className={cn(saveRowBtnCls, "inline-flex items-center gap-1.5")}>
              {isPending ? <Spinner className="h-3.5 w-3.5" /> : null}
              {isPending ? "Guardando…" : "Guardar"}
            </PulsatingButton>
            <DeleteButton form={deleteFormId} disabled={deletePending} />
          </>
        ) : (
          <>
            <span className={readCls}>{modelo.nombre}</span>
            <span className={cn(readCls, "text-[var(--color-foreground-muted)]")}>
              {modelo.marcaNombre ?? "—"}
            </span>
          </>
        )}
      </form>
      <form id={deleteFormId} action={deleteFormAction} className="hidden">
        <input type="hidden" name="modeloId" value={modelo.id} />
      </form>
      <RowError error={state.error ?? deleteState.error} />
    </div>
  );
}

function MotorRow({
  motor,
  index,
  updateAction,
  deleteAction,
  canEdit,
}: {
  motor: TechnicalMotor;
  index: number;
  updateAction: ActionFn;
  deleteAction: ActionFn;
  canEdit: boolean;
}) {
  const deleteFormId = `delete-motor-${motor.id}`;
  const [state, formAction, isPending] = useActionState(updateAction, { error: null });
  const [deleteState, deleteFormAction, deletePending] = useActionState(deleteAction, { error: null });

  return (
    <div className={cn(index % 2 === 1 && "bg-[var(--color-surface-alt)]/40")}>
      <form
        action={canEdit ? formAction : undefined}
        className="grid items-center gap-2 px-4 py-2.5 md:grid-cols-[1fr_140px_auto_auto]"
      >
        <input type="hidden" name="motorId" value={motor.id} />
        {canEdit ? (
          <>
            <input
              type="text"
              name="nombre"
              defaultValue={motor.nombre}
              disabled={isPending}
              className={cn("min-w-0", fieldCls)}
            />
            <input
              type="text"
              name="cilindrada"
              defaultValue={motor.cilindrada ?? ""}
              placeholder="Cilindrada"
              disabled={isPending}
              className={fieldCls}
            />
            <PulsatingButton type="submit" pulsing={!isPending} disabled={isPending} className={cn(saveRowBtnCls, "inline-flex items-center gap-1.5")}>
              {isPending ? <Spinner className="h-3.5 w-3.5" /> : null}
              {isPending ? "Guardando…" : "Guardar"}
            </PulsatingButton>
            <DeleteButton form={deleteFormId} disabled={deletePending} />
          </>
        ) : (
          <>
            <span className={readCls}>{motor.nombre}</span>
            <span className={cn(readCls, "text-[var(--color-foreground-muted)]")}>
              {motor.cilindrada ?? "—"}
            </span>
          </>
        )}
      </form>
      <form id={deleteFormId} action={deleteFormAction} className="hidden">
        <input type="hidden" name="motorId" value={motor.id} />
      </form>
      <RowError error={state.error ?? deleteState.error} />
    </div>
  );
}

function VehiculoRow({
  vehiculo,
  index,
  modelos,
  motores,
  updateAction,
  deleteAction,
  canEdit,
  hiddenVehiculos,
  confirmVehiculoHiddenChange,
  toggleHiddenAction,
}: {
  vehiculo: TechnicalVehiculo;
  index: number;
  modelos: TechnicalModelo[];
  motores: TechnicalMotor[];
  updateAction: ActionFn;
  deleteAction: ActionFn;
  canEdit: boolean;
  hiddenVehiculos: Set<number>;
  confirmVehiculoHiddenChange: (vehiculoId: number, hidden: boolean) => void;
  toggleHiddenAction: ActionFn;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const deleteFormId = `delete-vehiculo-${vehiculo.id}`;
  const toggleHiddenFormId = `toggle-hidden-vehiculo-${vehiculo.id}`;
  const [state, formAction, isPending] = useActionState(updateAction, { error: null });
  const [deleteState, deleteFormAction, deletePending] = useActionState(deleteAction, { error: null });
  const [toggleState, toggleHiddenFormAction, togglePending] = useActionState(toggleHiddenAction, { error: null });
  const isHidden = hiddenVehiculos.has(vehiculo.id);
  const [pendingHidden, setPendingHidden] = useState(isHidden);

  useEffect(() => {
    setPendingHidden(isHidden);
  }, [isHidden]);

  const prevTogglePending = useRef(togglePending);
  useEffect(() => {
    if (prevTogglePending.current && !togglePending && !toggleState.error) {
      confirmVehiculoHiddenChange(vehiculo.id, pendingHidden);
    }
    prevTogglePending.current = togglePending;
  }, [togglePending, toggleState.error, pendingHidden, confirmVehiculoHiddenChange, vehiculo.id]);

  return (
    <div className={cn(index % 2 === 1 && "bg-[var(--color-surface-alt)]/40")}>
      <form
        action={canEdit ? formAction : undefined}
        className={cn("grid items-center gap-2 px-4 py-2.5", isEditing && canEdit ? "md:grid-cols-[1fr_1fr_auto_auto_auto]" : "")}
      >
        <input type="hidden" name="vehiculoId" value={vehiculo.id} />
        {isEditing && canEdit ? (
          <>
            <select
              name="modeloId"
              defaultValue={vehiculo.modeloId}
              disabled={isPending}
              className={fieldCls}
            >
              {modelos.map((m) => (
                <option key={m.id} value={m.id}>
                  {(m.marcaNombre ? `${m.marcaNombre} / ` : "") + m.nombre}
                </option>
              ))}
            </select>
            <select
              name="motorId"
              defaultValue={vehiculo.motorId}
              disabled={isPending}
              className={fieldCls}
            >
              {motores.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}{m.cilindrada ? ` (${m.cilindrada})` : ""}
                </option>
              ))}
            </select>
            <PulsatingButton type="submit" pulsing={!isPending} disabled={isPending} className={saveRowBtnCls}>
              Guardar
            </PulsatingButton>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={isPending}
              className={saveRowBtnCls}
            >
              Cancelar
            </button>
            <DeleteButton form={deleteFormId} disabled={deletePending} />
          </>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2.5">
            <span className={cn("flex-1", readCls)}>
              {vehiculo.marcaNombre ? `${vehiculo.marcaNombre} / ` : ""}
              {vehiculo.modeloNombre}
            </span>
            <span className={cn("flex-1", readCls, "text-[var(--color-foreground-muted)]")}>
              {vehiculo.motorNombre}
            </span>
            <button
              type="button"
              onClick={() => setPendingHidden((prev) => !prev)}
              disabled={!canEdit}
              className={cn(
                "shrink-0 rounded-full border border-[var(--color-border)] p-1.5 transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]",
                pendingHidden && "border-[var(--color-foreground-muted)] text-[var(--color-foreground-muted)]",
                !canEdit && "opacity-40"
              )}
              title={canEdit ? (pendingHidden ? "Mostrar vehículo" : "Ocultar vehículo") : "Necesitás permisos para editar"}
            >
              <Icon name={pendingHidden ? "eyeSlash" : "eye"} className="h-4 w-4" />
            </button>
            {canEdit && (
              <>
                {pendingHidden !== isHidden && (
                  <PulsatingButton
                    type="submit"
                    form={toggleHiddenFormId}
                    pulsing={!togglePending}
                    disabled={togglePending}
                    className={cn(saveRowBtnCls, "inline-flex items-center gap-1.5")}
                  >
                    {togglePending ? <Spinner className="h-3.5 w-3.5" /> : null}
                    {togglePending ? "Guardando…" : "Guardar"}
                  </PulsatingButton>
                )}
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className={saveRowBtnCls}
                >
                  Editar
                </button>
                <DeleteButton form={deleteFormId} disabled={deletePending} />
              </>
            )}
          </div>
        )}
      </form>
      <form id={deleteFormId} action={deleteFormAction} className="hidden">
        <input type="hidden" name="vehiculoId" value={vehiculo.id} />
      </form>
      <form id={toggleHiddenFormId} action={toggleHiddenFormAction} className="hidden">
        <input type="hidden" name="vehiculoId" value={vehiculo.id} />
        <input type="hidden" name="hidden" value={pendingHidden ? "1" : "0"} />
      </form>
      <RowError error={state.error ?? deleteState.error ?? toggleState.error} />
    </div>
  );
}

function AddFooter({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex flex-wrap items-start gap-3 bg-[var(--color-info-bg)] px-4 py-3"
      style={{ borderTop: "2px dashed var(--color-info-border-strong)" }}
    >
      {children}
    </div>
  );
}

const addBtnCls = buttonStyles({
  className:
    "gap-2 !text-white bg-[var(--color-info-text)] uppercase hover:bg-[var(--color-info-text-strong)] whitespace-nowrap shrink-0",
});

function AddMarcaForm({ action }: { action: ActionFn }) {
  const [state, formAction, isPending] = useActionState(action, {
    error: null,
    resetKey: 0,
  });
  return (
    <AddFooter>
      <form
        key={state.resetKey ?? 0}
        action={formAction}
        className="flex flex-1 flex-wrap items-center gap-3"
      >
        <input
          name="nombre"
          placeholder="Nueva marca…"
          required
          disabled={isPending}
          className={cn("min-w-0 flex-1", addFieldCls)}
        />
        <button type="submit" disabled={isPending} className={addBtnCls}>
          {isPending ? <Spinner className="h-4 w-4" /> : <Icon name="plus" className="h-4 w-4" />}
          {isPending ? "Agregando…" : "Agregar marca"}
        </button>
      </form>
      {state.error && (
        <p className="w-full text-xs text-[var(--color-danger-text)]">{state.error}</p>
      )}
    </AddFooter>
  );
}

function AddModeloForm({
  marcas,
  action,
}: {
  marcas: TechnicalMarca[];
  action: ActionFn;
}) {
  const [state, formAction, isPending] = useActionState(action, {
    error: null,
    resetKey: 0,
  });
  return (
    <AddFooter>
      <form
        key={state.resetKey ?? 0}
        action={formAction}
        className="flex flex-1 flex-wrap items-center gap-3"
      >
        <input
          name="nombre"
          placeholder="Nuevo modelo…"
          required
          disabled={isPending}
          className={cn("min-w-0 flex-1", addFieldCls)}
        />
        <select
          name="marcaId"
          defaultValue=""
          required
          disabled={isPending}
          className={cn("w-44 shrink-0", addFieldCls)}
        >
          <option value="" disabled>
            Seleccionar marca
          </option>
          {marcas.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nombre}
            </option>
          ))}
        </select>
        <button type="submit" disabled={isPending} className={addBtnCls}>
          {isPending ? <Spinner className="h-4 w-4" /> : <Icon name="plus" className="h-4 w-4" />}
          {isPending ? "Agregando…" : "Agregar modelo"}
        </button>
      </form>
      {state.error && (
        <p className="w-full text-xs text-[var(--color-danger-text)]">{state.error}</p>
      )}
    </AddFooter>
  );
}

function AddMotorForm({ action }: { action: ActionFn }) {
  const [state, formAction, isPending] = useActionState(action, {
    error: null,
    resetKey: 0,
  });
  return (
    <AddFooter>
      <form
        key={state.resetKey ?? 0}
        action={formAction}
        className="flex flex-1 flex-wrap items-center gap-3"
      >
        <input
          name="nombre"
          placeholder="Nuevo motor…"
          required
          disabled={isPending}
          className={cn("min-w-0 flex-1", addFieldCls)}
        />
        <input
          name="cilindrada"
          placeholder="Cilindrada (ej. 1.6)"
          disabled={isPending}
          className={cn("w-40 shrink-0", addFieldCls)}
        />
        <button type="submit" disabled={isPending} className={addBtnCls}>
          {isPending ? <Spinner className="h-4 w-4" /> : <Icon name="plus" className="h-4 w-4" />}
          {isPending ? "Agregando…" : "Agregar motor"}
        </button>
      </form>
      {state.error && (
        <p className="w-full text-xs text-[var(--color-danger-text)]">{state.error}</p>
      )}
    </AddFooter>
  );
}

function AddVehiculoForm({
  modelos,
  motores,
  action,
}: {
  modelos: TechnicalModelo[];
  motores: TechnicalMotor[];
  action: ActionFn;
}) {
  const [state, formAction, isPending] = useActionState(action, {
    error: null,
    resetKey: 0,
  });
  return (
    <AddFooter>
      <form
        key={state.resetKey ?? 0}
        action={formAction}
        className="flex flex-1 flex-wrap items-center gap-3"
      >
        <select
          name="modeloId"
          defaultValue=""
          required
          disabled={isPending}
          className={cn("min-w-0 flex-1", addFieldCls)}
        >
          <option value="" disabled>
            Seleccionar modelo
          </option>
          {modelos.map((m) => (
            <option key={m.id} value={m.id}>
              {(m.marcaNombre ? `${m.marcaNombre} / ` : "") + m.nombre}
            </option>
          ))}
        </select>
        <select
          name="motorId"
          defaultValue=""
          required
          disabled={isPending}
          className={cn("w-52 shrink-0", addFieldCls)}
        >
          <option value="" disabled>
            Seleccionar motor
          </option>
          {motores.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nombre}{m.cilindrada ? ` (${m.cilindrada})` : ""}
            </option>
          ))}
        </select>
        <button type="submit" disabled={isPending} className={addBtnCls}>
          {isPending ? <Spinner className="h-4 w-4" /> : <Icon name="plus" className="h-4 w-4" />}
          {isPending ? "Agregando…" : "Agregar relación"}
        </button>
      </form>
      {state.error && (
        <p className="w-full text-xs text-[var(--color-danger-text)]">{state.error}</p>
      )}
    </AddFooter>
  );
}

// ─── Column headers ───────────────────────────────────────────────────────────

function ColHeaders({ cols }: { cols: Array<{ label: string; className?: string }> }) {
  return (
    <div className="flex items-center gap-2">
      {cols.map(({ label, className }) => (
        <span
          key={label}
          className={cn(
            "text-[11px] font-semibold uppercase tracking-wider text-[var(--color-foreground-muted)]",
            className
          )}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

// ─── Props & page ─────────────────────────────────────────────────────────────

type Props = {
  activeSection: TechnicalSection;
  q: string;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  sectionCounts: Record<TechnicalSection, number>;
  marcas: TechnicalMarca[];
  modelos: TechnicalModelo[];
  motores: TechnicalMotor[];
  vehiculos: TechnicalVehiculo[];
  canEdit: boolean;
  createMarcaAction: ActionFn;
  updateMarcaAction: ActionFn;
  deleteMarcaAction: ActionFn;
  createModeloAction: ActionFn;
  updateModeloAction: ActionFn;
  deleteModeloAction: ActionFn;
  createMotorAction: ActionFn;
  updateMotorAction: ActionFn;
  deleteMotorAction: ActionFn;
  createVehiculoAction: ActionFn;
  updateVehiculoAction: ActionFn;
  deleteVehiculoAction: ActionFn;
  toggleVehiculoHiddenAction: ActionFn;
};

export function InformacionTecnicaPage({
  activeSection,
  q,
  currentPage,
  pageSize,
  totalItems,
  sectionCounts,
  marcas,
  modelos,
  motores,
  vehiculos,
  canEdit,
  createMarcaAction,
  updateMarcaAction,
  deleteMarcaAction,
  createModeloAction,
  updateModeloAction,
  deleteModeloAction,
  createMotorAction,
  updateMotorAction,
  deleteMotorAction,
  createVehiculoAction,
  updateVehiculoAction,
  deleteVehiculoAction,
  toggleVehiculoHiddenAction,
}: Props) {
  const [hiddenMarcas, setHiddenMarcas] = useState<Set<number>>(
    () => new Set(marcas.filter((m) => m.hidden).map((m) => m.id))
  );
  const [hiddenVehiculos, setHiddenVehiculos] = useState<Set<number>>(
    () => new Set(vehiculos.filter((v) => v.hidden).map((v) => v.id))
  );
  const [marcasTab, setMarcasTab] = useState<"visible" | "ocultas">("visible");
  const [vehiculosTab, setVehiculosTab] = useState<"visible" | "ocultos">("visible");

  const confirmMarcaHiddenChange = (marcaId: number, hidden: boolean) => {
    setHiddenMarcas(prev => {
      const newSet = new Set(prev);
      if (hidden) {
        newSet.add(marcaId);
      } else {
        newSet.delete(marcaId);
      }
      return newSet;
    });

    const modelosDeMarca = modelos.filter(m => m.marcaId === marcaId);
    const vehiculosDeMarca = vehiculos.filter(v => modelosDeMarca.some(m => m.id === v.modeloId));
    setHiddenVehiculos(prev => {
      const newSet = new Set(prev);
      if (hidden) {
        vehiculosDeMarca.forEach((v) => newSet.add(v.id));
      } else {
        vehiculosDeMarca.forEach((v) => newSet.delete(v.id));
      }
      return newSet;
    });
  };

  const confirmVehiculoHiddenChange = (vehiculoId: number, hidden: boolean) => {
    setHiddenVehiculos(prev => {
      const newSet = new Set(prev);
      if (hidden) {
        newSet.add(vehiculoId);
      } else {
        newSet.delete(vehiculoId);
      }
      return newSet;
    });
  };

  const filteredModelos = modelos.filter(m => !hiddenMarcas.has(m.marcaId));
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  const pageStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(currentPage * pageSize, totalItems);

  const cardCommon = {
    section: activeSection,
    count: sectionCounts[activeSection],
    q,
    currentPage,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    pageStart,
    pageEnd,
    totalItems,
  };

  let sectionContent: React.ReactNode = null;

  if (activeSection === "marcas") {
    const marcasVisibles = marcas.filter(m => !hiddenMarcas.has(m.id));
    const marcasOcultas = marcas.filter(m => hiddenMarcas.has(m.id));
    const marcasActivas = marcasTab === "visible" ? marcasVisibles : marcasOcultas;
    sectionContent = (
      <ContentCard
        {...cardCommon}
        emptyLabel={
          marcasTab === "ocultas"
            ? "No hay marcas ocultas."
            : q ? "Sin resultados para la búsqueda." : "No hay marcas aún."
        }
        createForm={canEdit && marcasTab === "visible" ? <AddMarcaForm action={createMarcaAction} /> : undefined}
        tabsSlot={
          <ButtonGroup
            options={[
              { value: "visible", label: "Visibles", icon: "eye" },
              { value: "ocultas", label: `Ocultas${marcasOcultas.length > 0 ? ` (${marcasOcultas.length})` : ""}`, icon: "eyeSlash" },
            ]}
            value={marcasTab}
            onChange={setMarcasTab}
            className="scale-[0.82] origin-right p-0.5"
            buttonClassName="gap-1 px-2 py-1 text-[11px]"
          />
        }
      >
        {marcasActivas.map((marca, i) => (
          <MarcaRow
            key={marca.id}
            marca={marca}
            index={i}
            updateAction={updateMarcaAction}
            deleteAction={deleteMarcaAction}
            canEdit={canEdit}
            hiddenMarcas={hiddenMarcas}
            confirmMarcaHiddenChange={confirmMarcaHiddenChange}
          />
        ))}
      </ContentCard>
    );
  }

  if (activeSection === "modelos") {
    sectionContent = (
      <ContentCard
        {...cardCommon}
        emptyLabel={q ? "Sin resultados para la búsqueda." : "No hay modelos aún."}
        columnHeaders={
          canEdit ? (
            <ColHeaders
              cols={[
                { label: "Nombre", className: "flex-1" },
                { label: "Marca", className: "w-[180px]" },
              ]}
            />
          ) : undefined
        }
        createForm={
          canEdit ? (
            <AddModeloForm marcas={marcas} action={createModeloAction} />
          ) : undefined
        }
      >
        {filteredModelos.map((modelo, i) => (
          <ModeloRow
            key={modelo.id}
            modelo={modelo}
            index={i}
            marcas={marcas}
            updateAction={updateModeloAction}
            deleteAction={deleteModeloAction}
            canEdit={canEdit}
          />
        ))}
      </ContentCard>
    );
  }

  if (activeSection === "motores") {
    sectionContent = (
      <ContentCard
        {...cardCommon}
        emptyLabel={q ? "Sin resultados para la búsqueda." : "No hay motores aún."}
        columnHeaders={
          canEdit ? (
            <ColHeaders
              cols={[
                { label: "Nombre", className: "flex-1" },
                { label: "Cilindrada", className: "w-[140px]" },
              ]}
            />
          ) : undefined
        }
        createForm={canEdit ? <AddMotorForm action={createMotorAction} /> : undefined}
      >
        {motores.map((motor, i) => (
          <MotorRow
            key={motor.id}
            motor={motor}
            index={i}
            updateAction={updateMotorAction}
            deleteAction={deleteMotorAction}
            canEdit={canEdit}
          />
        ))}
      </ContentCard>
    );
  }

  if (activeSection === "vehiculos") {
    const vehiculosVisibles = vehiculos.filter(v => !hiddenVehiculos.has(v.id));
    const vehiculosOcultos = vehiculos.filter(v => hiddenVehiculos.has(v.id));
    const vehiculosActivos = vehiculosTab === "visible" ? vehiculosVisibles : vehiculosOcultos;
    sectionContent = (
      <ContentCard
        {...cardCommon}
        emptyLabel={
          vehiculosTab === "ocultos"
            ? "No hay vehículos ocultos."
            : q ? "Sin resultados para la búsqueda." : "No hay relaciones aún."
        }
        columnHeaders={
          canEdit ? (
            <ColHeaders
              cols={[
                { label: "Modelo", className: "flex-1" },
                { label: "Motor", className: "flex-1" },
              ]}
            />
          ) : undefined
        }
        createForm={
          canEdit && vehiculosTab === "visible" ? (
            <AddVehiculoForm
              modelos={modelos}
              motores={motores}
              action={createVehiculoAction}
            />
          ) : undefined
        }
        tabsSlot={
          <ButtonGroup
            options={[
              { value: "visible", label: "Visibles", icon: "eye" },
              { value: "ocultos", label: `Ocultos${vehiculosOcultos.length > 0 ? ` (${vehiculosOcultos.length})` : ""}`, icon: "eyeSlash" },
            ]}
            value={vehiculosTab}
            onChange={setVehiculosTab}
            className="scale-[0.82] origin-right p-0.5"
            buttonClassName="gap-1 px-2 py-1 text-[11px]"
          />
        }
      >
        {vehiculosActivos.map((vehiculo, i) => (
          <VehiculoRow
            key={vehiculo.id}
            vehiculo={vehiculo}
            index={i}
            modelos={modelos}
            motores={motores}
            updateAction={updateVehiculoAction}
            deleteAction={deleteVehiculoAction}
            canEdit={canEdit}
            hiddenVehiculos={hiddenVehiculos}
            confirmVehiculoHiddenChange={confirmVehiculoHiddenChange}
            toggleHiddenAction={toggleVehiculoHiddenAction}
          />
        ))}
      </ContentCard>
    );
  }

  return (
    <div
      className={cn(
        "InformacionTecnicaPage",
        styles.InformacionTecnicaPage,
        "space-y-6"
      )}
    >
      <PageHeader
        eyebrow="Catálogo técnico"
        title="Información técnica"
        description={`${totalItems.toLocaleString("es-AR")} ${SECTION_LABELS[activeSection].toLowerCase()} en el catálogo.`}
      />

      {!canEdit && (
        <section className="rounded-[24px] border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] px-5 py-4 text-sm text-[var(--color-warning-text)]">
          Tenés acceso de solo lectura. Para editar esta información necesitás un
          usuario con permisos de administración.
        </section>
      )}

      <Card as="nav">
        <SectionTabs
          activeSection={activeSection}
          q={q}
          sectionCounts={sectionCounts}
        />
      </Card>

      {sectionContent}
    </div>
  );
}
