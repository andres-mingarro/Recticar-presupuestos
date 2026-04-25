"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useActionState } from "react";
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
  action: (
    state: TrabajoFormState,
    formData: FormData
  ) => Promise<TrabajoFormState>;
  initialState: TrabajoFormState;
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
  showClienteSection?: boolean;
  showPrioridadSection?: boolean;
  showActions?: boolean;
  externalFormAction?: (payload: FormData) => void;
  externalState?: TrabajoFormState;
  externalIsPending?: boolean;
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
  const [open, setOpen] = useState(defaultOpen);
  const hasSelected = selectedCount > 0;
  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
      className={cn(
        "TrabajoFormAccordion",
        styles.TrabajoFormAccordion,
        "rounded-2xl border p-4 transition-colors",
        hasSelected
          ? "border-[var(--apricot-light)] bg-[linear-gradient(135deg,#fff7ed,#fff0e1)]"
          : "border-[var(--color-border)] bg-[var(--gray-20)]"
      )}
    >
      <summary className={cn("TrabajoFormAccordionSummary", styles.TrabajoFormAccordionSummary, "flex cursor-pointer list-none items-center justify-between gap-3")}>
        <span className={cn("text-sm font-semibold", hasSelected ? "text-[var(--brown-burnt)]" : "text-[var(--text-color-defult)]")}>
          {categoriaNombre}
        </span>
        <span className="flex items-center gap-2">
          {hasSelected && (
            <span className="rounded-full bg-[var(--orange-vivid)] px-2 py-0.5 text-[0.65rem] font-bold text-white">
              {selectedCount}
            </span>
          )}
          <Icon name="chevronDown" className={cn("TrabajoFormAccordionChevron", styles.TrabajoFormAccordionChevron, "h-4 w-4 text-[var(--text-color-gray)] transition-transform duration-200")} />
        </span>
      </summary>
      {children}
    </details>
  );
}

export function TrabajoForm({
  action,
  initialState,
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
  showClienteSection = true,
  showPrioridadSection = true,
  showActions = true,
  externalFormAction,
  externalState,
  externalIsPending,
  onSummaryChange,
}: TrabajoFormProps) {
  const [internalState, internalFormAction, internalIsPending] = useActionState(action, initialState);
  const state = externalState ?? internalState;
  const formAction = externalFormAction ?? internalFormAction;
  const isPending = externalIsPending ?? internalIsPending;
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (isPending) setDirty(false);
  }, [isPending]);
  const {
    selectedIds: selectedTrabajoIds,
    toggle: toggleTrabajo,
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
  const [selectedMarca, setSelectedMarca] = useState(initialState.values.marcaId ?? "");
  const [selectedModelo, setSelectedModelo] = useState(initialState.values.modeloId ?? "");
  const [selectedMotor, setSelectedMotor] = useState(initialState.values.motorId ?? "");
  const [selectedNumeroSerieMotor, setSelectedNumeroSerieMotor] = useState(
    initialState.values.numeroSerieMotor ?? ""
  );
  const [selectedPrioridad, setSelectedPrioridad] = useState(initialState.values.prioridad);
  const [selectedEstado, setSelectedEstado] = useState(initialState.values.estado);
  const [selectedClienteLabel, setSelectedClienteLabel] = useState(initialClienteLabel);
  const [selectedItemsTab, setSelectedItemsTab] = useState<"trabajos" | "repuestos">("trabajos");
  const [wizardOpen, setWizardOpen] = useState(false);
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
      prioridad: selectedPrioridad,
      estado: selectedEstado,
    });
  }, [
    onSummaryChange,
    selectedClienteLabel,
    selectedMarcaNombre,
    selectedModeloNombre,
    selectedMotorNombre,
    selectedNumeroSerieMotor,
    selectedPrioridad,
    selectedEstado,
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
        <input key={`trabajo-hidden-${id}`} type="hidden" name="trabajosIds" value={id} />
      ))}
      {Object.entries(selectedRepuestoItems).map(([id, item]) => {
        const repuestoInfo = repuestos.flatMap((g) => g.repuestos).find((r) => r.id === Number(id));
        const stockDisponible = repuestoInfo?.stockHabilitado ? repuestoInfo.stockCantidad : 0;
        // Para repuestos ya comprometidos (item.cantidadStock > 0), el stock del catálogo ya fue
        // descontado por este trabajo, así que sumamos lo comprometido al disponible actual para
        // calcular cuánto puede salir del stock en total.
        const stockEfectivo = stockDisponible + item.cantidadStock;
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

              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-[var(--text-color-defult)]">Lista de precios</span>
                <ButtonGroup
                  options={[
                    { value: 1, label: "Lista 1", icon: "clipboardList" },
                    { value: 2, label: "Lista 2", icon: "clipboardList" },
                    { value: 3, label: "Lista 3", icon: "clipboardList" },
                  ]}
                  value={listaPrecios}
                  onChange={setListaPrecios}
                />
                <input type="hidden" name="listaPrecios" value={listaPrecios} />
              </div>

              <IvaToggle form={formId} />

              <div className={cn("TrabajoFormChecklist", styles.TrabajoFormChecklist)}>
                {trabajos.map((grupo) => {
                  const selectedCount = grupo.trabajos.filter((t) => selectedTrabajoIds.has(t.id)).length;
                  const hasSelected = selectedCount > 0;
                  return (
                    <details
                      key={grupo.categoriaId}
                      open={hasSelected}
                      className={cn(
                        "TrabajoFormAccordion",
                        styles.TrabajoFormAccordion,
                        "rounded-2xl border p-4 transition-colors",
                        hasSelected
                          ? "border-[var(--apricot-light)] bg-[linear-gradient(135deg,#fff7ed,#fff0e1)]"
                          : "border-[var(--color-border)] bg-[var(--gray-20)]"
                      )}
                    >
                      <summary className={cn("TrabajoFormAccordionSummary", styles.TrabajoFormAccordionSummary, "flex cursor-pointer list-none items-center justify-between gap-3")}>
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
                        <span className="flex items-center gap-2">
                          {hasSelected && (
                            <span className="rounded-full bg-[var(--orange-vivid)] px-2 py-0.5 text-[0.65rem] font-bold text-white">
                              {selectedCount}
                            </span>
                          )}
                          <Icon name="chevronDown" className={cn("TrabajoFormAccordionChevron", styles.TrabajoFormAccordionChevron, "h-4 w-4 text-[var(--text-color-gray)] transition-transform duration-200")} />
                        </span>
                      </summary>
                      <div className="mt-3 grid gap-2 md:grid-cols-2">
                        {grupo.trabajos.map((trabajo) => (
                          <TrabajoItemCard
                            key={trabajo.id}
                            checked={selectedTrabajoIds.has(trabajo.id)}
                            value={trabajo.id}
                            onCheckedChange={(checked) => toggleTrabajo(trabajo.id, checked)}
                            label={
                              selectedTrabajoIds.has(trabajo.id)
                                ? (snapshotTrabajoNombreById.get(trabajo.id) ?? trabajo.nombre)
                                : trabajo.nombre
                            }
                          />
                        ))}
                      </div>
                    </details>
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
                          // El stock visible suma el disponible en catálogo más lo que este trabajo ya comprometió
                          // (porque ese stock ya fue descontado del catálogo por este mismo trabajo)
                          const cantStockDisponible = repuesto.stockHabilitado
                            ? repuesto.stockCantidad + cantidadStockComprometida
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
                              <div className={cn("w-full sm:pl-9", styles.TrabajoFormRepuestoBody)}>
                                <div className={styles.TrabajoFormRepuestoRow}>
                                  <div className={styles.TrabajoFormRepuestoField}>
                                    <span className={styles.TrabajoFormRepuestoFieldLabel}>Necesitas</span>
                                    <Incrementor
                                      value={cantidad}
                                      onDecrement={() => decrementCantidad(repuesto.id)}
                                      onIncrement={() => incrementCantidad(repuesto.id)}
                                      disabled={!isChecked}
                                      className="h-9"
                                      incrementoSmall
                                    />
                                  </div>

                                  {repuesto.stockHabilitado && (
                                    <>
                                      <div className={styles.TrabajoFormRepuestoField}>
                                        <span className={styles.TrabajoFormRepuestoFieldLabel}>Hay en stock</span>
                                        <span className={cn(styles.TrabajoFormRepuestoFieldValue, styles.TrabajoFormRepuestoFieldValueStock)}>
                                          {cantStockDisponible}
                                        </span>
                                      </div>

                                      <div className={styles.TrabajoFormRepuestoField}>
                                        <span className={styles.TrabajoFormRepuestoFieldLabel}>Se usa del stock</span>
                                        <span className={cn(styles.TrabajoFormRepuestoFieldValue, styles.TrabajoFormRepuestoFieldValueStock)}>
                                          {cantDesdeStock}
                                        </span>
                                      </div>

                                      <div className={styles.TrabajoFormRepuestoField}>
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
                                    </>
                                  )}

                                  <div className={styles.TrabajoFormRepuestoField}>
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
                                        ? `Necesitas ${cantidad} unidades: ${cantDesdeStock} salen del stock y ${cantFaltante} hay que comprarlas al proveedor.`
                                        : `Necesitas ${cantidad} unidades y se cubren completas con stock. Quedan ${stockRestante} unidades disponibles.`}
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
                              </div>
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
            value={selectedPrioridad}
            onChange={setSelectedPrioridad}
          />
          <input type="hidden" name="prioridad" value={selectedPrioridad} />

          <EstadoStepper
            name="estado"
            initialValue={state.values.estado}
            value={selectedEstado}
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
