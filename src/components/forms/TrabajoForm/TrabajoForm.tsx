"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { LISTAS_PRECIOS, getPrecioLista } from "@/lib/db";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import type {
  Marca,
  Modelo,
  ModeloMotorRelation,
  Motor,
  TrabajoFormValues,
  TrabajoPrioridad,
  RepuestoAgrupado,
  TrabajoAgrupado,
} from "@/lib/types";
import { useTrabajosSeleccion } from "./TrabajosSeleccionContext";
import { useRepuestosSeleccion } from "./RepuestosSeleccionContext";
import { TrabajoItemCard } from "./TrabajoItemCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EstadoStepper } from "@/components/ui/EstadoStepper";
import { Icon } from "@/components/ui/Icon";
import { PriceInput } from "@/components/ui/PriceInput";
import { Textarea } from "@/components/ui/Textarea";
import { ClienteAutocomplete } from "@/components/search/ClienteAutocomplete";
import { ButtonGroup } from "@/components/ui/ButtonGroup";
import { Spinner } from "@/components/ui/Spinner";
import { PulsatingButton } from "@/components/ui/PulsatingButton";
import { Tabs } from "@/components/ui/Tabs";
import { Incrementor } from "@/components/ui/Incrementor";
import { EngineIconGlyph, isEngineIconName } from "@/components/ui/EngineIcons";
import { VehiculoMobileSelector } from "./VehiculoMobileSelector";
import type { TrabajoDetalleItem } from "@/lib/queries/catalogo";
import type { RepuestoDetalleItem } from "@/lib/queries/repuestos";
import { IvaToggle } from "@/components/ui/IvaToggle";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import styles from "./TrabajoForm.module.scss";

export type TrabajoFormState = {
  error: string | null;
  values: TrabajoFormValues;
};

export type TrabajoFormSummary = {
  clienteLabel: string;
  marcaNombre: string | null;
  modeloNombre: string | null;
  motorNombre: string | null;
  numeroSerieMotor: string;
  prioridad: TrabajoPrioridad;
  estado: TrabajoFormValues["estado"];
};

type TrabajoFormProps = {
  formAction: (payload: FormData) => void;
  state: TrabajoFormState;
  isPending: boolean;
  initialClienteLabel?: string;
  marcas: Marca[];
  modelos: Modelo[];
  motores: Motor[];
  relations: ModeloMotorRelation[];
  trabajos: TrabajoAgrupado[];
  repuestos: RepuestoAgrupado[];
  snapshotTrabajos?: TrabajoDetalleItem[];
  snapshotRepuestos?: RepuestoDetalleItem[];
  allowFinalizado?: boolean;
  formId?: string;
  prioridadValue?: TrabajoPrioridad;
  estadoValue?: TrabajoFormValues["estado"];
  showClienteSection?: boolean;
  showPrioridadSection?: boolean;
  showActions?: boolean;
  showCantidad?: boolean;
  onSummaryChange?: (summary: TrabajoFormSummary) => void;
};

const prioridadCards: Array<{
  value: TrabajoPrioridad;
  label: string;
  activeTone: string;
}> = [
  {
    value: "baja",
    label: "Baja",
    activeTone: "border-slate-600 bg-[linear-gradient(135deg,#475569,#1e293b)] text-white shadow-[0_10px_24px_rgba(51,65,85,0.28)]",
  },
  {
    value: "normal",
    label: "Normal",
    activeTone: "border-sky-600 bg-[linear-gradient(135deg,#0284c7,#38bdf8)] text-white shadow-[0_10px_24px_rgba(2,132,199,0.3)]",
  },
  {
    value: "alta",
    label: "Alta",
    activeTone: "border-rose-600 bg-[linear-gradient(135deg,#e11d48,#fb7185)] text-white shadow-[0_10px_24px_rgba(225,29,72,0.3)]",
  },
];

function GrupoAccordion({
  defaultOpen,
  summary,
  selectedCount,
  hasSelected,
  children,
}: {
  defaultOpen: boolean;
  summary: ReactNode;
  selectedCount: number;
  hasSelected: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className={cn(
        "TrabajoFormAccordion",
        styles.TrabajoFormAccordion,
        "rounded-2xl border p-4 transition-colors",
        hasSelected
          ? "border-[var(--apricot-light)] bg-[linear-gradient(135deg,#fff7ed,#fff0e1)]"
          : "border-[var(--color-border)] bg-[var(--gray-20)]"
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn("TrabajoFormAccordionSummary", styles.TrabajoFormAccordionSummary, "flex w-full cursor-pointer items-center justify-between gap-3")}
      >
        {summary}
        <span className="flex items-center gap-2">
          {selectedCount > 0 && (
            <span className="rounded-full bg-[var(--orange-vivid)] px-2 py-0.5 text-[0.65rem] font-bold text-white">
              {selectedCount}
            </span>
          )}
          <Icon
            name="chevronDown"
            className={cn(
              "TrabajoFormAccordionChevron",
              styles.TrabajoFormAccordionChevron,
              "h-4 w-4 text-[var(--text-color-gray)] transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </span>
      </button>
      <div className={cn(styles.TrabajoFormAccordionBody, open && styles.TrabajoFormAccordionBodyOpen)}>
        <div className={cn(styles.TrabajoFormAccordionInner, "pt-3")}>
          {children}
        </div>
      </div>
    </div>
  );
}

function RepuestoGrupoAccordion({
  defaultOpen,
  categoriaNombre,
  selectedCount,
  children,
}: {
  defaultOpen: boolean;
  categoriaNombre: string;
  selectedCount: number;
  children: ReactNode;
}) {
  const hasSelected = selectedCount > 0;
  return (
    <GrupoAccordion
      defaultOpen={defaultOpen}
      selectedCount={selectedCount}
      hasSelected={hasSelected}
      summary={
        <span className={cn("text-sm font-semibold", hasSelected ? "text-[var(--brown-burnt)]" : "text-[var(--text-color-defult)]")}>
          {categoriaNombre}
        </span>
      }
    >
      {children}
    </GrupoAccordion>
  );
}

export function TrabajoForm({
  formAction,
  state,
  isPending,
  initialClienteLabel = "",
  marcas,
  modelos,
  motores,
  relations,
  trabajos,
  repuestos,
  snapshotTrabajos = [],
  snapshotRepuestos = [],
  allowFinalizado = false,
  formId,
  prioridadValue,
  estadoValue,
  showClienteSection = true,
  showPrioridadSection = true,
  showActions = true,
  showCantidad = false,
  onSummaryChange,
}: TrabajoFormProps) {
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (isPending) setDirty(false);
  }, [isPending]);
  const {
    selectedIds: selectedTrabajoIds,
    cantidades: trabajoCantidades,
    toggle: toggleTrabajo,
    incrementCantidad: incrementTrabajoCantidad,
    decrementCantidad: decrementTrabajoCantidad,
    listaPrecios,
    setListaPrecios,
  } = useTrabajosSeleccion();
  const {
    selectedIds: selectedRepuestoIds,
    selectedItems: selectedRepuestoItems,
    toggle: toggleRepuesto,
    setPrecioUnitario,
    incrementCantidad,
    decrementCantidad,
  } = useRepuestosSeleccion();
  const [selectedMarca, setSelectedMarca] = useState(state.values.marcaId ?? "");
  const [selectedModelo, setSelectedModelo] = useState(state.values.modeloId ?? "");
  const [selectedMotor, setSelectedMotor] = useState(state.values.motorId ?? "");
  const [selectedNumeroSerieMotor, setSelectedNumeroSerieMotor] = useState(
    state.values.numeroSerieMotor ?? ""
  );
  const [selectedPrioridad, setSelectedPrioridad] = useState(state.values.prioridad);
  const [selectedEstado, setSelectedEstado] = useState(state.values.estado);
  const [selectedClienteLabel, setSelectedClienteLabel] = useState(initialClienteLabel);
  const [selectedItemsTab, setSelectedItemsTab] = useState<"trabajos" | "repuestos">("trabajos");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [listaDialogOpen, setListaDialogOpen] = useState(false);
  const [wizardInitialStep, setWizardInitialStep] = useState(0);

  const openWizard = (step: number) => {
    setWizardInitialStep(step);
    setWizardOpen(true);
  };

  useEffect(() => {
    setSelectedPrioridad(state.values.prioridad);
  }, [state.values.prioridad]);

  useEffect(() => {
    setSelectedEstado(state.values.estado);
  }, [state.values.estado]);

  useEffect(() => {
    setSelectedNumeroSerieMotor(state.values.numeroSerieMotor ?? "");
  }, [state.values.numeroSerieMotor]);

  useEffect(() => {
    setSelectedClienteLabel(initialClienteLabel);
  }, [initialClienteLabel]);

  const motoresIds = useMemo(
    () =>
      relations
        .filter((relation) =>
          selectedModelo ? String(relation.modelo_id) === selectedModelo : false
        )
        .map((relation) => relation.motor_id),
    [relations, selectedModelo]
  );

  const selectedMarcaNombre = useMemo(
    () => marcas.find((marca) => String(marca.id) === selectedMarca)?.nombre ?? null,
    [marcas, selectedMarca]
  );
  const effectivePrioridad = prioridadValue ?? selectedPrioridad;
  const effectiveEstado = estadoValue ?? selectedEstado;

  const selectedModeloNombre = useMemo(
    () => modelos.find((modelo) => String(modelo.id) === selectedModelo)?.nombre ?? null,
    [modelos, selectedModelo]
  );

  const selectedMotorNombre = useMemo(
    () =>
      motores.find(
        (motor) => String(motor.id) === selectedMotor && motoresIds.includes(motor.id)
      )?.nombre ?? null,
    [motores, motoresIds, selectedMotor]
  );
  const snapshotTrabajoNombreById = useMemo(
    () =>
      new Map(
        snapshotTrabajos
          .filter((item) => item.trabajoId !== null)
          .map((item) => [item.trabajoId as number, item.trabajoNombre])
      ),
    [snapshotTrabajos]
  );
  const snapshotRepuestoNombreById = useMemo(
    () =>
      new Map(
        snapshotRepuestos
          .filter((item) => item.repuestoId !== null)
          .map((item) => [item.repuestoId as number, item.repuestoNombre])
      ),
    [snapshotRepuestos]
  );

  useEffect(() => {
    onSummaryChange?.({
      clienteLabel: selectedClienteLabel,
      marcaNombre: selectedMarcaNombre,
      modeloNombre: selectedModeloNombre,
      motorNombre: selectedMotorNombre,
      numeroSerieMotor: selectedNumeroSerieMotor,
      prioridad: effectivePrioridad,
      estado: effectiveEstado,
    });
  }, [
    onSummaryChange,
    selectedClienteLabel,
    selectedMarcaNombre,
    selectedModeloNombre,
    selectedMotorNombre,
    selectedNumeroSerieMotor,
    effectivePrioridad,
    effectiveEstado,
  ]);

  return (
    <form
      id={formId}
      action={formAction}
      onInput={() => setDirty(true)}
      onChangeCapture={() => setDirty(true)}
      className={cn("TrabajoForm", styles.TrabajoForm, "mb-12 space-y-6")}
    >
      <input type="hidden" name="updatedAt" value={state.values.updatedAt ?? ""} />
      {Array.from(selectedTrabajoIds).map((id) => (
        <div key={`trabajo-hidden-${id}`}>
          <input type="hidden" name="trabajosIds" value={id} />
          <input type="hidden" name={`trabajoCantidad_${id}`} value={trabajoCantidades[id] ?? 1} />
        </div>
      ))}
      {Object.entries(selectedRepuestoItems).map(([id, item]) => {
        const repuestoInfo = repuestos.flatMap((g) => g.repuestos).find((r) => r.id === Number(id));
        const stockDisponible = repuestoInfo?.stockHabilitado ? repuestoInfo.stockCantidad : 0;
        // Solo se suma la cantidad comprometida si el trabajo ya está aprobado/finalizado,
        // porque en esos estados el catálogo ya fue decrementado por este trabajo.
        const yaDescontado = effectiveEstado === "aprobado" || effectiveEstado === "finalizado";
        const stockEfectivo = stockDisponible + (yaDescontado ? item.cantidadStock : 0);
        const cantidadStock = Math.min(item.cantidad, stockEfectivo);
        return (
          <div key={`repuesto-hidden-${id}`}>
            <input type="hidden" name="repuestosIds" value={id} />
            <input type="hidden" name={`repuestoPrecio_${id}`} value={item.precioUnitario} />
            <input type="hidden" name={`repuestoCantidad_${id}`} value={item.cantidad} />
            <input type="hidden" name={`repuestoPrecioStock_${id}`} value={item.precioStock} />
            <input type="hidden" name={`repuestoCantidadStock_${id}`} value={cantidadStock} />
          </div>
        );
      })}

      {showClienteSection ? (
        <TrabajoClienteSection
          initialClienteId={state.values.clienteId}
          initialClienteLabel={initialClienteLabel}
          formId={formId}
          onClienteLabelChange={setSelectedClienteLabel}
        />
      ) : null}

      <Card
        as="section"
        className={cn(
          "TrabajoFormSection",
          styles.TrabajoFormSection
        )}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
            Vehiculo y motor
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--text-color-defult)]">
            Selección técnica
          </h2>
        </div>

        <VehiculoMobileSelector
          marcas={marcas}
          modelos={modelos}
          motores={motores}
          relations={relations}
          selectedMarca={selectedMarca}
          selectedModelo={selectedModelo}
          selectedMotor={selectedMotor}
          selectedMarcaNombre={selectedMarcaNombre}
          selectedModeloNombre={selectedModeloNombre}
          selectedMotorNombre={selectedMotorNombre}
          selectedNumeroSerieMotor={selectedNumeroSerieMotor}
          wizardOpen={wizardOpen}
          wizardInitialStep={wizardInitialStep}
          onOpenWizard={openWizard}
          onWizardOpenChange={setWizardOpen}
          onSelect={(mId, moId, mtId) => {
            setSelectedMarca(mId);
            setSelectedModelo(moId);
            setSelectedMotor(mtId);
          }}
          onNumeroSerieChange={setSelectedNumeroSerieMotor}
        />

        {/* Hidden input serie — fuente de verdad para el form en ambos modos */}
        <input type="hidden" name="numeroSerieMotor" value={selectedNumeroSerieMotor ?? ""} />
      </Card>

      <div className="space-y-0">
        <Tabs
          expand
          value={selectedItemsTab}
          onChange={setSelectedItemsTab}
          options={[
            { value: "trabajos", label: "Trabajos", icon: "car" },
            { value: "repuestos", label: "Repuestos", icon: "settings" },
          ]}
        />

        <Card
          as="section"
          className={cn(
            "TrabajoFormSection -mt-px",
            styles.TrabajoFormSection
          )}
        >
          {selectedItemsTab === "trabajos" ? (
            <>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                  Trabajos
                </p>
                <h2 className="mt-2 inline-flex items-center gap-2 text-xl font-semibold tracking-tight text-[var(--text-color-defult)]">
                  <Icon name="listCheck" size="lg" className="text-current" />
                  Checklist por categoria
                </h2>
              </div>

              <div className="rounded-2xl border border-[var(--apricot-light)]/60 bg-[linear-gradient(135deg,var(--cream-warm)/40,var(--peach-soft)/30)] p-3 flex flex-col gap-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--brown-burnt)]/70">Lista de precios</span>

                {/* Mobile: botón con estilo ButtonGroup */}
                <div className="md:hidden inline-flex w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-1.5">
                  <button
                    type="button"
                    onClick={() => setListaDialogOpen(true)}
                    className="inline-flex flex-1 items-center justify-between gap-2 rounded-xl border border-[var(--color-accent)] bg-[var(--color-accent)] px-3 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(234,88,12,0.28)] transition focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-soft)]"
                  >
                    <span className="flex items-center gap-2 uppercase tracking-wider">
                      <Icon name="clipboardList" className="h-4 w-4 shrink-0" />
                      Lista {listaPrecios}
                    </span>
                    <Icon name="chevronDown" className="h-4 w-4 opacity-80" />
                  </button>
                </div>

                {/* Desktop: ButtonGroup */}
                <div className="hidden md:block w-full">
                  <ButtonGroup
                    options={LISTAS_PRECIOS.map((n) => ({ value: n, label: `Lista ${n}`, icon: "clipboardList" as const }))}
                    value={listaPrecios}
                    onChange={setListaPrecios}
                    className="w-full"
                  />
                </div>

                <input type="hidden" name="listaPrecios" value={listaPrecios} />

                {/* Modal centrado mobile */}
                <Dialog open={listaDialogOpen} onOpenChange={setListaDialogOpen}>
                  <DialogContent variant="centered">
                    <div className="rounded-t-[20px] bg-[linear-gradient(135deg,var(--cream-warm),rgba(255,255,255,0.95))] border-b border-[rgba(234,88,12,0.12)] pl-6 pr-14 pt-6 pb-4">
                      <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                        Lista de precios
                      </p>
                      <h3 className="mt-1 text-xl font-semibold tracking-tight text-[var(--text-color-defult)]">
                        Lista {listaPrecios} activa
                      </h3>
                      <p className="mt-1 text-xs text-[var(--text-color-gray)]">
                        Seleccioná la lista activa
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 overflow-y-auto p-4">
                      {LISTAS_PRECIOS.map((n) => {
                        const isActive = n === listaPrecios;
                        return (
                          <button
                            key={n}
                            type="button"
                            onClick={() => { setListaPrecios(n); setListaDialogOpen(false); }}
                            className={cn(
                              "flex items-center gap-3 w-full rounded-xl px-4 py-4 text-left text-sm font-semibold transition-all",
                              isActive
                                ? "bg-[linear-gradient(135deg,var(--orange-vivid),var(--apricot-light))] text-white shadow-sm"
                                : "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--text-color-defult)] hover:bg-[var(--color-surface-alt)]"
                            )}
                          >
                            <Icon name="clipboardList" className="h-5 w-5 shrink-0" />
                            <span className="flex-1">Lista {n}</span>
                            {isActive && <Icon name="check" className="h-4 w-4" />}
                          </button>
                        );
                      })}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <IvaToggle form={formId} />

              <div className={cn("TrabajoFormChecklist", styles.TrabajoFormChecklist)}>
                {trabajos.map((grupo) => {
                  const selectedCount = grupo.trabajos.filter((t) => selectedTrabajoIds.has(t.id)).length;
                  const hasSelected = selectedCount > 0;
                  return (
                    <GrupoAccordion
                      key={grupo.categoriaId}
                      defaultOpen={hasSelected}
                      selectedCount={selectedCount}
                      hasSelected={hasSelected}
                      summary={
                        <span className="flex items-center gap-2.5">
                          {isEngineIconName(grupo.categoriaIcono) ? (
                            <EngineIconGlyph
                              name={grupo.categoriaIcono}
                              className={cn("h-6 w-6 shrink-0", hasSelected ? "text-[var(--color-accent)]" : "text-[var(--text-color-gray)]")}
                            />
                          ) : null}
                          <span className={cn("text-sm font-semibold", hasSelected ? "text-[var(--brown-burnt)]" : "text-[var(--text-color-defult)]")}>
                            {grupo.categoriaNombre}
                          </span>
                        </span>
                      }
                    >
                      <div className="mt-3 grid gap-2">
                        {grupo.trabajos.map((trabajo) => {
                          const isChecked = selectedTrabajoIds.has(trabajo.id);
                          const precioUnit = getPrecioLista(trabajo, listaPrecios);
                          const cantidad = trabajoCantidades[trabajo.id] ?? 1;
                          const total = precioUnit * cantidad;
                          return (
                            <TrabajoItemCard
                              key={trabajo.id}
                              checked={isChecked}
                              value={trabajo.id}
                              onCheckedChange={(checked) => toggleTrabajo(trabajo.id, checked)}
                              label={
                                isChecked
                                  ? (snapshotTrabajoNombreById.get(trabajo.id) ?? trabajo.nombre)
                                  : trabajo.nombre
                              }
                              precioLabel={showCantidad ? (cantidad > 1 ? `x${cantidad} ${formatPrice(total)}` : formatPrice(precioUnit)) : undefined}
                            >
                              {showCantidad && isChecked && (
                                <Incrementor
                                  value={cantidad}
                                  onIncrement={() => incrementTrabajoCantidad(trabajo.id)}
                                  onDecrement={() => decrementTrabajoCantidad(trabajo.id)}
                                />
                              )}
                            </TrabajoItemCard>
                          );
                        })}
                      </div>
                    </GrupoAccordion>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                  Repuestos
                </p>
                <h2 className="mt-2 inline-flex items-center gap-2 text-xl font-semibold tracking-tight text-[var(--text-color-defult)]">
                  <Icon name="listCheck" size="lg" className="text-current" />
                  Checklist por categoria
                </h2>
              </div>

              <div className={cn("TrabajoFormChecklist", styles.TrabajoFormChecklist)}>
                {repuestos.map((grupo) => {
                  const selectedCount = grupo.repuestos.filter((r) => selectedRepuestoIds.has(r.id)).length;
                  const hasSelected = selectedCount > 0;
                  return (
                    <RepuestoGrupoAccordion
                      key={grupo.categoriaId}
                      defaultOpen={hasSelected}
                      categoriaNombre={grupo.categoriaNombre}
                      selectedCount={selectedCount}
                    >
                      <div className="mt-3 flex flex-col gap-2">
                        {grupo.repuestos.map((repuesto) => {
                          const isChecked = selectedRepuestoIds.has(repuesto.id);
                          const precioUnit = selectedRepuestoItems[repuesto.id]?.precioUnitario ?? 0;
                          const cantidad = selectedRepuestoItems[repuesto.id]?.cantidad ?? 1;
                          // precio_stock viene del catálogo, se inicializa al seleccionar
                          const precioStockUnit = selectedRepuestoItems[repuesto.id]?.precioStock ?? repuesto.precioStock;

                          const cantidadStockComprometida = selectedRepuestoItems[repuesto.id]?.cantidadStock ?? 0;
                          // Solo se suma la cantidad comprometida al stock del catálogo si el trabajo está
                          // aprobado o finalizado — en esos estados el catálogo ya fue decrementado por este trabajo.
                          // En pendiente/presupuesto_entregado el catálogo todavía tiene el stock completo.
                          const estadoActual = selectedEstado;
                          const stockFueDescontado = estadoActual === "aprobado" || estadoActual === "finalizado";
                          const cantStockDisponible = repuesto.stockHabilitado
                            ? repuesto.stockCantidad + (stockFueDescontado ? cantidadStockComprometida : 0)
                            : 0;
                          const cantDesdeStock = Math.min(cantidad, cantStockDisponible);
                          const cantFaltante = Math.max(0, cantidad - cantStockDisponible);
                          const stockRestante = Math.max(0, cantStockDisponible - cantDesdeStock);
                          const usaStock = repuesto.stockHabilitado && cantDesdeStock > 0;
                          const requiereProveedor = repuesto.stockHabilitado && cantFaltante > 0;
                          const subtotalStock = precioStockUnit * cantDesdeStock;
                          const subtotalProveedor = precioUnit * cantFaltante;

                          // total = precio_stock * cant_stock + precio_proveedor * cant_faltante
                          const total = repuesto.stockHabilitado
                            ? subtotalStock + subtotalProveedor
                            : precioUnit * cantidad;

                          return (
                            <TrabajoItemCard
                              key={repuesto.id}
                              checked={isChecked}
                              value={repuesto.id}
                              onCheckedChange={(checked) => toggleRepuesto(repuesto.id, checked, repuesto.precioStock)}
                              label={
                                isChecked
                                  ? (snapshotRepuestoNombreById.get(repuesto.id) ?? repuesto.nombre)
                                  : repuesto.nombre
                              }
                              contentClassName="flex-col gap-2.5"
                              checkboxClassName="[--checkbox-size:24px]"
                            >
                              <div className={cn("w-full sm:pl-9", styles.TrabajoFormRepuestoBodyWrap, isChecked && styles.TrabajoFormRepuestoBodyWrapOpen)}><div className={cn(styles.TrabajoFormRepuestoBody)}>
                                <div className={styles.TrabajoFormRepuestoRow}>
                                  <div className={cn(styles.TrabajoFormRepuestoField, styles.TrabajoFormRepuestoFieldCantidad)}>
                                    <span className={styles.TrabajoFormRepuestoFieldLabel}>Cantidad</span>
                                    <Incrementor
                                      value={cantidad}
                                      onDecrement={() => decrementCantidad(repuesto.id)}
                                      onIncrement={() => incrementCantidad(repuesto.id)}
                                      disabled={!isChecked}
                                      className="h-9"
                                      incrementoSmall
                                    />
                                  </div>

                                  <div className={cn(styles.TrabajoFormRepuestoField, "transition-[opacity,visibility] duration-200", repuesto.stockHabilitado ? "opacity-100 visible" : "opacity-0 invisible")}>
                                    <span className={styles.TrabajoFormRepuestoFieldLabel}>Stock restante</span>
                                    <span className={cn(styles.TrabajoFormRepuestoFieldValue, styles.TrabajoFormRepuestoFieldValueStock)}>
                                      {stockRestante}
                                    </span>
                                  </div>

                                  <div className={cn(styles.TrabajoFormRepuestoField, "transition-[opacity,visibility] duration-200", repuesto.stockHabilitado ? "opacity-100 visible" : "opacity-0 invisible")}>
                                    <span className={styles.TrabajoFormRepuestoFieldLabel}>Se compra</span>
                                    <span className={cn(
                                      styles.TrabajoFormRepuestoFieldValue,
                                      requiereProveedor
                                        ? styles.TrabajoFormRepuestoFieldValueWarning
                                        : styles.TrabajoFormRepuestoFieldValueMuted
                                    )}>
                                      {cantFaltante}
                                    </span>
                                  </div>

                                  <div className={cn(styles.TrabajoFormRepuestoField, styles.PrecioProveedor, styles.TrabajoFormRepuestoFieldPrecio, "transition-[opacity,visibility] duration-200", (!repuesto.stockHabilitado || requiereProveedor) ? "opacity-100 visible" : "opacity-0 invisible")}>
                                    <span className={styles.TrabajoFormRepuestoFieldLabel}>
                                      {repuesto.stockHabilitado ? "Precio proveedor" : "Precio unitario"}
                                    </span>
                                    {(!repuesto.stockHabilitado || requiereProveedor) ? (
                                      <PriceInput
                                        value={precioUnit}
                                        disabled={!isChecked}
                                        onChange={(v) => setPrecioUnitario(repuesto.id, v)}
                                        className="h-9 w-[11ch] min-w-[11ch]"
                                      />
                                    ) : (
                                      <span className={cn(styles.TrabajoFormRepuestoFieldValue, styles.TrabajoFormRepuestoFieldValueMuted)}>
                                        No hace falta
                                      </span>
                                    )}
                                  </div>

                                  <div className={cn(styles.TrabajoFormRepuestoField, styles.TrabajoFormRepuestoFieldTotal)}>
                                    <span className={styles.TrabajoFormRepuestoFieldLabel}>Total</span>
                                    <span
                                      className={cn(
                                        styles.TrabajoFormRepuestoTotalValue,
                                        isChecked
                                          ? "text-[var(--brown-burnt)]"
                                          : "text-[var(--text-color-gray)]"
                                      )}
                                    >
                                      {formatPrice(total)}
                                    </span>
                                  </div>
                                </div>

                                {repuesto.stockHabilitado && isChecked && (
                                  <div className={styles.TrabajoFormRepuestoBreakdown}>
                                    <span className={styles.TrabajoFormRepuestoBreakdownHint}>
                                      {requiereProveedor
                                        ? `${cantidad} unidades: ${cantDesdeStock} salen del stock y ${cantFaltante} hay que comprarlas al proveedor.`
                                        : `${cantidad} unidades cubiertas con stock. Quedan ${stockRestante} unidades disponibles.`}
                                    </span>
                                    {(usaStock || requiereProveedor) && (
                                      <span className={styles.TrabajoFormRepuestoBreakdownHint}>
                                        {usaStock ? `Stock ${formatPrice(subtotalStock)}` : "Stock $ 0"}{" · "}
                                        {requiereProveedor
                                          ? `Proveedor ${formatPrice(subtotalProveedor)}`
                                          : "Proveedor $ 0"}
                                      </span>
                                    )}
                                  </div>
                                )}

                                {!repuesto.stockHabilitado && isChecked && (
                                  <div className={styles.TrabajoFormRepuestoBreakdown}>
                                    <span className={styles.TrabajoFormRepuestoBreakdownHint}>
                                      No hay stock cargado para este repuesto. Las {cantidad} unidades se calculan completas con precio de proveedor.
                                    </span>
                                  </div>
                                )}
                              </div></div>
                            </TrabajoItemCard>
                          );
                        })}
                      </div>
                    </RepuestoGrupoAccordion>
                  );
                })}
              </div>
            </>
          )}
        </Card>
      </div>

      {showPrioridadSection ? (
        <Card
          as="section"
          className={cn(
            "TrabajoFormSection",
            styles.TrabajoFormSection
          )}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
              Prioridad y estado
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--text-color-defult)]">
              Definicion del trabajo
            </h2>
          </div>

          <ButtonGroup
            options={prioridadCards}
            value={effectivePrioridad}
            onChange={setSelectedPrioridad}
          />
          <input type="hidden" name="prioridad" value={effectivePrioridad} />

          <EstadoStepper
            name="estado"
            initialValue={state.values.estado}
            value={effectiveEstado}
            onChange={setSelectedEstado}
            allowFinalizado={allowFinalizado}
          />

          <label className={cn("TrabajoFormField", styles.TrabajoFormField)}>
            <span className="text-sm font-medium text-[var(--text-color-defult)]">
              Observaciones
            </span>
            <Textarea
              name="observaciones"
              placeholder="Notas adicionales del trabajo, aclaraciones del trabajo o comentarios del cliente."
              defaultValue={state.values.observaciones}
            />
          </label>
        </Card>
      ) : (
        <>
          <Card
            as="section"
            className={cn("TrabajoFormSection", styles.TrabajoFormSection)}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                Notas
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--text-color-defult)]">
                Observaciones
              </h2>
            </div>
            <label className={cn("TrabajoFormField", styles.TrabajoFormField)}>
              <Textarea
                name="observaciones"
                placeholder="Notas adicionales del trabajo, aclaraciones del trabajo o comentarios del cliente."
                defaultValue={state.values.observaciones}
              />
            </label>
          </Card>
        </>
      )}

      {state.error ? (
        <section className="rounded-[24px] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-5 py-4 text-sm text-[var(--color-danger-text)]">
          {state.error}
        </section>
      ) : null}

      {showActions ? (
        <div className={cn("TrabajoFormActions", styles.TrabajoFormActions)}>
          <PulsatingButton
            type="submit"
            pulsing={dirty && !isPending}
            disabled={isPending}
            className="w-full flex-1 gap-2"
          >
            {isPending ? <Spinner className="h-4 w-4" /> : null}
            {isPending ? "Guardando..." : "Guardar trabajo"}
          </PulsatingButton>
          <Button
            as="a"
            href="/trabajos"
            variant="secondary"
            className="w-full flex-1"
          >
            Cancelar
          </Button>
        </div>
      ) : null}
    </form>
  );
}

export function TrabajoClienteSection({
  initialClienteId = "",
  initialClienteLabel = "",
  formId,
  onClienteLabelChange,
}: {
  initialClienteId?: string;
  initialClienteLabel?: string;
  formId?: string;
  onClienteLabelChange?: (label: string) => void;
}) {
  return (
    <Card
      as="section"
      className={cn(
        "TrabajoFormSection",
        styles.TrabajoFormSection
      )}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
          Cliente
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--text-color-defult)]">
          Asignación del cliente
        </h2>
      </div>

      <div className={cn("TrabajoFormField", styles.TrabajoFormField)}>
        <span className="text-sm font-medium text-[var(--text-color-defult)]">
          Cliente asociado
        </span>
        <ClienteAutocomplete
          name="clienteId"
          initialId={initialClienteId}
          initialLabel={initialClienteLabel}
          form={formId}
          onSelectionChange={(_, label) => onClienteLabelChange?.(label)}
        />
      </div>
    </Card>
  );
}
