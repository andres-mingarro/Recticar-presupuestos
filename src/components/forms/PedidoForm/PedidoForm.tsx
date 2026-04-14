"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useActionState } from "react";
import { cn } from "@/lib/cn";
import type {
  Marca,
  Modelo,
  ModeloMotorRelation,
  Motor,
  PedidoFormValues,
  PedidoPrioridad,
  TrabajoAgrupado,
} from "@/lib/types";
import { useTrabajosSeleccion } from "./TrabajosSeleccionContext";
import { buttonStyles } from "@/components/ui/Button";
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
import styles from "./PedidoForm.module.scss";

export type PedidoFormState = {
  error: string | null;
  values: PedidoFormValues;
};

type PedidoFormProps = {
  action: (
    state: PedidoFormState,
    formData: FormData
  ) => Promise<PedidoFormState>;
  initialState: PedidoFormState;
  initialClienteLabel?: string;
  marcas: Marca[];
  modelos: Modelo[];
  motores: Motor[];
  relations: ModeloMotorRelation[];
  trabajos: TrabajoAgrupado[];
  allowFinalizado?: boolean;
  formId?: string;
  showClienteSection?: boolean;
  showPrioridadSection?: boolean;
  showActions?: boolean;
  externalFormAction?: (payload: FormData) => void;
  externalState?: PedidoFormState;
  externalIsPending?: boolean;
};

const prioridadCards: Array<{
  value: PedidoPrioridad;
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

export function PedidoForm({
  action,
  initialState,
  initialClienteLabel = "",
  marcas,
  modelos,
  motores,
  relations,
  trabajos,
  allowFinalizado = false,
  formId,
  showClienteSection = true,
  showPrioridadSection = true,
  showActions = true,
  externalFormAction,
  externalState,
  externalIsPending,
}: PedidoFormProps) {
  const [internalState, internalFormAction, internalIsPending] = useActionState(action, initialState);
  const state = externalState ?? internalState;
  const formAction = externalFormAction ?? internalFormAction;
  const isPending = externalIsPending ?? internalIsPending;
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (isPending) setDirty(false);
  }, [isPending]);
  const { toggle: toggleTrabajo, listaPrecios, setListaPrecios } = useTrabajosSeleccion();
  const [selectedMarca, setSelectedMarca] = useState(initialState.values.marcaId);
  const [selectedModelo, setSelectedModelo] = useState(initialState.values.modeloId);
  const [selectedPrioridad, setSelectedPrioridad] = useState(initialState.values.prioridad);

  useEffect(() => {
    setSelectedPrioridad(state.values.prioridad);
  }, [state.values.prioridad]);

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

  return (
    <form
      id={formId}
      action={formAction}
      onInput={() => setDirty(true)}
      onClickCapture={() => setDirty(true)}
      className={cn("PedidoForm", styles.PedidoForm, "mb-12 space-y-6")}
    >
      {showClienteSection ? (
        <PedidoClienteSection
          initialClienteId={state.values.clienteId}
          initialClienteLabel={initialClienteLabel}
          formId={formId}
        />
      ) : null}

      <Card
        as="section"
        className={cn(
          "PedidoFormSection",
          styles.PedidoFormSection
        )}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
            Vehiculo y motor
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--color-foreground)]">
            Selección técnica
          </h2>
        </div>

        <div className={cn("PedidoFormGrid", styles.PedidoFormGrid)}>
          <label className={cn("PedidoFormField", styles.PedidoFormField)}>
            <span className="text-sm font-medium text-[var(--color-foreground)]">
              Marca
            </span>
            <Select
              name="marcaId"
              value={selectedMarca}
              onChange={(event) => {
                setSelectedMarca(event.target.value);
                setSelectedModelo("");
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

          <label className={cn("PedidoFormField", styles.PedidoFormField)}>
            <span className="text-sm font-medium text-[var(--color-foreground)]">
              Modelo
            </span>
            <Select
              name="modeloId"
              value={selectedModelo}
              onChange={(event) => setSelectedModelo(event.target.value)}
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

          <label className={cn("PedidoFormField", styles.PedidoFormField)}>
            <span className="text-sm font-medium text-[var(--color-foreground)]">
              Motor
            </span>
            <Select name="motorId" defaultValue={state.values.motorId} disabled={!selectedModelo}>
              <option value="">Seleccionar motor</option>
              {motoresFiltrados.map((motor) => (
                <option key={motor.id} value={motor.id}>
                  {motor.nombre}
                </option>
              ))}
            </Select>
          </label>

          <label className={cn("PedidoFormField", styles.PedidoFormField)}>
            <span className="text-sm font-medium text-[var(--color-foreground)]">
              Numero de serie del motor
            </span>
            <Input
              name="numeroSerieMotor"
              placeholder="Ej. ABC-1234"
              defaultValue={state.values.numeroSerieMotor}
            />
          </label>
        </div>
      </Card>

      <Card
        as="section"
        className={cn(
          "PedidoFormSection",
          styles.PedidoFormSection
        )}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
            Trabajos
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--color-foreground)]">
            Checklist por categoria
          </h2>
        </div>

        {/* Selector de lista de precios */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[var(--color-foreground)]">Lista de precios</span>
          <ButtonGroup
            options={[
              { value: 1, label: "Lista 1" },
              { value: 2, label: "Lista 2" },
              { value: 3, label: "Lista 3" },
            ]}
            value={listaPrecios}
            onChange={setListaPrecios}
          />
          <input type="hidden" name="listaPrecios" value={listaPrecios} />
        </div>

        <div className={cn("PedidoFormChecklist", styles.PedidoFormChecklist)}>
          {trabajos.map((grupo) => {
            const hasSelected = grupo.trabajos.some((t) =>
              state.values.trabajosIds.includes(String(t.id))
            );
            return (
            <details
              key={grupo.categoriaId}
              open={hasSelected}
              className={cn("PedidoFormAccordion", styles.PedidoFormAccordion, "rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4")}
            >
              <summary className={cn("PedidoFormAccordionSummary", styles.PedidoFormAccordionSummary, "flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-[var(--color-foreground)]")}>
                <span>{grupo.categoriaNombre}</span>
                <Icon name="chevronDown" className={cn("PedidoFormAccordionChevron", styles.PedidoFormAccordionChevron, "h-4 w-4 text-[var(--color-foreground-muted)] transition-transform duration-200")} />
              </summary>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {grupo.trabajos.map((trabajo) => (
                  <label
                    key={trabajo.id}
                    className="flex items-start gap-3 rounded-xl bg-white px-4 py-3 text-sm text-[var(--color-foreground)]"
                  >
                    <input
                      type="checkbox"
                      name="trabajosIds"
                      value={trabajo.id}
                      defaultChecked={state.values.trabajosIds.includes(
                        String(trabajo.id)
                      )}
                      onChange={(e) => toggleTrabajo(trabajo.id, e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-accent)]"
                    />
                    <span>{trabajo.nombre}</span>
                  </label>
                ))}
              </div>
            </details>
          );
          })}
        </div>
      </Card>

      {showPrioridadSection ? (
        <Card
          as="section"
          className={cn(
            "PedidoFormSection",
            styles.PedidoFormSection
          )}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
              Prioridad y estado
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--color-foreground)]">
              Definicion del pedido
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
            allowFinalizado={allowFinalizado}
          />

          <label className={cn("PedidoFormField", styles.PedidoFormField)}>
            <span className="text-sm font-medium text-[var(--color-foreground)]">
              Observaciones
            </span>
            <Textarea
              name="observaciones"
              placeholder="Notas adicionales del pedido, aclaraciones del trabajo o comentarios del cliente."
              defaultValue={state.values.observaciones}
            />
          </label>
        </Card>
      ) : (
        <>
          <Card
            as="section"
            className={cn("PedidoFormSection", styles.PedidoFormSection)}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                Notas
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--color-foreground)]">
                Observaciones
              </h2>
            </div>
            <label className={cn("PedidoFormField", styles.PedidoFormField)}>
              <Textarea
                name="observaciones"
                placeholder="Notas adicionales del pedido, aclaraciones del trabajo o comentarios del cliente."
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
        <div className={cn("PedidoFormActions", styles.PedidoFormActions)}>
          <PulsatingButton
            type="submit"
            pulsing={dirty && !isPending}
            disabled={isPending}
            className="w-full flex-1 gap-2"
          >
            {isPending ? <Spinner className="h-4 w-4" /> : null}
            {isPending ? "Guardando..." : "Guardar pedido"}
          </PulsatingButton>
          <Link
            href="/pedidos"
            className={buttonStyles({ variant: "secondary", className: "w-full flex-1" })}
          >
            Cancelar
          </Link>
        </div>
      ) : null}
    </form>
  );
}

export function PedidoClienteSection({
  initialClienteId = "",
  initialClienteLabel = "",
  formId,
}: {
  initialClienteId?: string;
  initialClienteLabel?: string;
  formId?: string;
}) {
  return (
    <Card
      as="section"
      className={cn(
        "PedidoFormSection",
        styles.PedidoFormSection
      )}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
          Cliente
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--color-foreground)]">
          Asignación del cliente
        </h2>
      </div>

      <div className={cn("PedidoFormField", styles.PedidoFormField)}>
        <span className="text-sm font-medium text-[var(--color-foreground)]">
          Cliente asociado
        </span>
        <ClienteAutocomplete
          name="clienteId"
          initialId={initialClienteId}
          initialLabel={initialClienteLabel}
          form={formId}
        />
      </div>
    </Card>
  );
}
