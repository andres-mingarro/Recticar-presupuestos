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
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { ClienteAutocomplete } from "@/components/search/ClienteAutocomplete";
import { ButtonGroup } from "@/components/ui/ButtonGroup";
import { Spinner } from "@/components/ui/Spinner";
import { PulsatingButton } from "@/components/ui/PulsatingButton";
import { Tabs } from "@/components/ui/Tabs";
import { Incrementor } from "@/components/ui/Incrementor";
import { SeleccionTecnicaWizard } from "@/components/forms/SeleccionTecnicaWizard";
import { getBrandLogoUrl } from "@/lib/vehicle-logo";
import Image from "next/image";
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
  children,
}: {
  defaultOpen: boolean;
  categoriaNombre: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
      className={cn("TrabajoFormAccordion", styles.TrabajoFormAccordion, "rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4")}
    >
      <summary className={cn("TrabajoFormAccordionSummary", styles.TrabajoFormAccordionSummary, "flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-[var(--text-color-defult)]")}>
        <span>{categoriaNombre}</span>
        <Icon name="chevronDown" className={cn("TrabajoFormAccordionChevron", styles.TrabajoFormAccordionChevron, "h-4 w-4 text-[var(--text-color-gray)] transition-transform duration-200")} />
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
  const [selectedMarca, setSelectedMarca] = useState(initialState.values.marcaId);
  const [selectedModelo, setSelectedModelo] = useState(initialState.values.modeloId);
  const [selectedMotor, setSelectedMotor] = useState(initialState.values.motorId);
  const [selectedNumeroSerieMotor, setSelectedNumeroSerieMotor] = useState(initialState.values.numeroSerieMotor);
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
    setSelectedNumeroSerieMotor(state.values.numeroSerieMotor);
  }, [state.values.numeroSerieMotor]);

  useEffect(() => {
    setSelectedClienteLabel(initialClienteLabel);
  }, [initialClienteLabel]);

  const modelosFiltrados = useMemo(
    () =>
      modelos.filter((modelo) =>
        selectedMarca ? String(modelo.marca_id) === selectedMarca : false
      ),
    [modelos, selectedMarca]
  );

  const motoresIds = useMemo(
    () =>
      relations
        .filter((relation) =>
          selectedModelo ? String(relation.modelo_id) === selectedModelo : false
        )
        .map((relation) => relation.motor_id),
    [relations, selectedModelo]
  );

  const motoresFiltrados = useMemo(
    () => motores.filter((motor) => motoresIds.includes(motor.id)),
    [motores, motoresIds]
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
    () => motores.find((motor) => String(motor.id) === selectedMotor)?.nombre ?? null,
    [motores, selectedMotor]
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
      onClickCapture={() => setDirty(true)}
      className={cn("TrabajoForm", styles.TrabajoForm, "mb-12 space-y-6")}
    >
      <input type="hidden" name="updatedAt" value={state.values.updatedAt ?? ""} />
      {Array.from(selectedTrabajoIds).map((id) => (
        <input key={`trabajo-hidden-${id}`} type="hidden" name="trabajosIds" value={id} />
      ))}
      {Object.entries(selectedRepuestoItems).map(([id, item]) => (
        <div key={`repuesto-hidden-${id}`}>
          <input type="hidden" name="repuestosIds" value={id} />
          <input type="hidden" name={`repuestoPrecio_${id}`} value={item.precioUnitario} />
          <input type="hidden" name={`repuestoCantidad_${id}`} value={item.cantidad} />
        </div>
      ))}

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

        {/* Mobile: wizard */}
        <div className="md:hidden">
          {selectedMarca ? (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              {(() => {
                const logoUrl = getBrandLogoUrl(selectedMarcaNombre ?? "");
                return logoUrl ? (
                  <button type="button" onClick={() => openWizard(0)} className="cursor-pointer">
                    <Image src={logoUrl} alt={selectedMarcaNombre ?? ""} width={150} height={150} className="object-contain" unoptimized />
                  </button>
                ) : (
                  <button type="button" onClick={() => openWizard(0)} className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-3xl font-bold text-[var(--color-accent)]">
                    {(selectedMarcaNombre ?? "?")[0].toUpperCase()}
                  </button>
                );
              })()}
              <div className="w-full divide-y divide-[var(--color-border)]">
                <button
                  type="button"
                  onClick={() => openWizard(0)}
                  className="flex w-full items-center justify-between py-3 text-left"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-color-ligth)]">Marca</span>
                  <span className="text-lg font-bold text-[var(--text-color-defult)]">{selectedMarcaNombre}</span>
                </button>
                <button
                  type="button"
                  onClick={() => openWizard(1)}
                  className="flex w-full items-center justify-between py-3 text-left"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-color-ligth)]">Modelo</span>
                  <span className="text-base font-semibold text-[var(--text-color-gray)]">{selectedModeloNombre ?? "—"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => openWizard(2)}
                  className="flex w-full items-center justify-between py-3 text-left"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-color-ligth)]">Motor</span>
                  <span className="text-base font-semibold text-[var(--text-color-gray)]">{selectedMotorNombre ?? "—"}</span>
                </button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => openWizard(0)}
              icon={<Icon name="car" className="h-4 w-4" />}
            >
              Seleccionar vehículo
            </Button>
          )}
          <SeleccionTecnicaWizard
            marcas={marcas}
            modelos={modelos}
            motores={motores}
            relations={relations}
            open={wizardOpen}
            onOpenChange={setWizardOpen}
            initialStep={wizardInitialStep}
            initialMarcaId={selectedMarca}
            initialModeloId={selectedModelo}
            initialMotorId={selectedMotor}
            onSelect={(mId, moId, mtId) => {
              setSelectedMarca(mId);
              setSelectedModelo(moId);
              setSelectedMotor(mtId);
            }}
          />
        </div>

        <label className={cn("TrabajoFormField md:hidden", styles.TrabajoFormField)}>
          <span className="text-sm font-medium text-[var(--text-color-defult)]">
            Número de serie del motor
          </span>
          <Input
            placeholder="Ej. ABC-1234"
            value={selectedNumeroSerieMotor}
            onChange={(event) => setSelectedNumeroSerieMotor(event.target.value)}
          />
        </label>

        {/* Hidden inputs para mobile — envían los valores del wizard al form */}
        <input type="hidden" name="marcaId" value={selectedMarca} className="md:hidden" />
        <input type="hidden" name="modeloId" value={selectedModelo} className="md:hidden" />
        <input type="hidden" name="motorId" value={selectedMotor} className="md:hidden" />

        {/* Campo serie — visible en ambos modos */}

        <div className={cn("TrabajoFormGrid", styles.TrabajoFormGrid, "hidden md:grid")}>
          <label className={cn("TrabajoFormField", styles.TrabajoFormField)}>
            <span className="text-sm font-medium text-[var(--text-color-defult)]">
              Marca
            </span>
            <Select
              value={selectedMarca}
              onChange={(event) => {
                setSelectedMarca(event.target.value);
                setSelectedModelo("");
                setSelectedMotor("");
              }}
            >
              <option value="">Seleccionar marca</option>
              {marcas.map((marca) => (
                <option key={marca.id} value={marca.id}>
                  {marca.nombre}
                </option>
              ))}
            </Select>
          </label>

          <label className={cn("TrabajoFormField", styles.TrabajoFormField)}>
            <span className="text-sm font-medium text-[var(--text-color-defult)]">
              Modelo
            </span>
            <Select
              value={selectedModelo}
              onChange={(event) => {
                setSelectedModelo(event.target.value);
                setSelectedMotor("");
              }}
              disabled={!selectedMarca}
            >
              <option value="">Seleccionar modelo</option>
              {modelosFiltrados.map((modelo) => (
                <option key={modelo.id} value={modelo.id}>
                  {modelo.nombre}
                </option>
              ))}
            </Select>
          </label>

          <label className={cn("TrabajoFormField", styles.TrabajoFormField)}>
            <span className="text-sm font-medium text-[var(--text-color-defult)]">
              Motor
            </span>
            <Select
              value={selectedMotor}
              onChange={(event) => setSelectedMotor(event.target.value)}
              disabled={!selectedModelo}
            >
              <option value="">Seleccionar motor</option>
              {motoresFiltrados.map((motor) => (
                <option key={motor.id} value={motor.id}>
                  {motor.nombre}
                </option>
              ))}
            </Select>
          </label>

          <label className={cn("TrabajoFormField", styles.TrabajoFormField)}>
            <span className="text-sm font-medium text-[var(--text-color-defult)]">
              Número de serie del motor
            </span>
            <Input
              placeholder="Ej. ABC-1234"
              value={selectedNumeroSerieMotor}
              onChange={(event) => setSelectedNumeroSerieMotor(event.target.value)}
            />
          </label>
        </div>

        {/* Hidden input serie — fuente de verdad para el form en ambos modos */}
        <input type="hidden" name="numeroSerieMotor" value={selectedNumeroSerieMotor} />
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

              <div className={cn("TrabajoFormChecklist", styles.TrabajoFormChecklist)}>
                {trabajos.map((grupo) => {
                  const hasSelected = grupo.trabajos.some((t) =>
                    selectedTrabajoIds.has(t.id)
                  );
                  return (
                    <details
                      key={grupo.categoriaId}
                      open={hasSelected}
                      className={cn("TrabajoFormAccordion", styles.TrabajoFormAccordion, "rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4")}
                    >
                      <summary className={cn("TrabajoFormAccordionSummary", styles.TrabajoFormAccordionSummary, "flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-[var(--text-color-defult)]")}>
                        <span>{grupo.categoriaNombre}</span>
                        <Icon name="chevronDown" className={cn("TrabajoFormAccordionChevron", styles.TrabajoFormAccordionChevron, "h-4 w-4 text-[var(--text-color-gray)] transition-transform duration-200")} />
                      </summary>
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {grupo.trabajos.map((trabajo) => (
                          <TrabajoItemCard
                            key={trabajo.id}
                            checked={selectedTrabajoIds.has(trabajo.id)}
                            value={trabajo.id}
                            onCheckedChange={(checked) => toggleTrabajo(trabajo.id, checked)}
                            label={trabajo.nombre}
                          >
                          </TrabajoItemCard>
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
                  const hasSelected = grupo.repuestos.some((r) =>
                    selectedRepuestoIds.has(r.id)
                  );
                  return (
                    <RepuestoGrupoAccordion
                      key={grupo.categoriaId}
                      defaultOpen={hasSelected}
                      categoriaNombre={grupo.categoriaNombre}
                    >
                      <div className="mt-4 grid gap-3">
                        {grupo.repuestos.map((repuesto) => (
                            <TrabajoItemCard
                              key={repuesto.id}
                              checked={selectedRepuestoIds.has(repuesto.id)}
                              value={repuesto.id}
                              onCheckedChange={(checked) => toggleRepuesto(repuesto.id, checked)}
                              label={repuesto.nombre}
                              contentClassName="flex-col gap-2"
                              checkboxClassName="[--checkbox-size:27px]"
                              >
                            <div className="content-trabajo-item-card lg:flex-1 lg:flex w-full items-center gap-2 grid grid-cols-[1fr_auto] lg:grid-cols-[120px_132px_120px]">
                              <Input
                                type="number"
                                min="0"
                                step="1"
                                inputMode="numeric"
                                value={selectedRepuestoItems[repuesto.id]?.precioUnitario ?? 0}
                                disabled={!selectedRepuestoIds.has(repuesto.id)}
                                onChange={(event) =>
                                  setPrecioUnitario(repuesto.id, Number(event.target.value))
                                }
                                className="text-right h-8 lg:h-11 lg:min-w-[88px] h-[33px]"
                              />
                              <Incrementor
                                value={selectedRepuestoItems[repuesto.id]?.cantidad ?? 1}
                                onDecrement={() => decrementCantidad(repuesto.id)}
                                onIncrement={() => incrementCantidad(repuesto.id)}
                                disabled={!selectedRepuestoIds.has(repuesto.id)}
                                className="justify-end lg:justify-center"
                              />
                              <span className="col-span-2 lg:col-span-1 lg:min-w-[88px] text-right text-[26px] font-bold text-[#5f2302] lg:text-base lg:text-[var(--text-color-defult)] border-t border-[var(--color-border)] pt-1 mt-0.5 lg:border-0 lg:pt-0 lg:mt-0">
                                {formatPrice(
                                  (selectedRepuestoItems[repuesto.id]?.precioUnitario ?? 0) *
                                    (selectedRepuestoItems[repuesto.id]?.cantidad ?? 1)
                                )}
                              </span>
                            </div>
                          </TrabajoItemCard>
                        ))}
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
