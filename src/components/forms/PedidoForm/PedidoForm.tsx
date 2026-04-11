"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
};

const prioridadCards: Array<{
  value: PedidoPrioridad;
  label: string;
  tone: string;
}> = [
  { value: "baja", label: "Baja", tone: "border-slate-200 bg-slate-50" },
  { value: "normal", label: "Normal", tone: "border-sky-200 bg-sky-50" },
  { value: "alta", label: "Alta", tone: "border-rose-200 bg-rose-50" },
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
}: PedidoFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const { toggle: toggleTrabajo, listaPrecios, setListaPrecios } = useTrabajosSeleccion();
  const [selectedMarca, setSelectedMarca] = useState(initialState.values.marcaId);
  const [selectedModelo, setSelectedModelo] = useState(initialState.values.modeloId);

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
      action={formAction}
      className={cn("PedidoForm", styles.PedidoForm, "space-y-6")}
    >
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
            initialId={state.values.clienteId}
            initialLabel={initialClienteLabel}
          />
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
          <div className="flex gap-2">
            {([1, 2, 3] as const).map((lista) => {
              const colors = {
                1: "border-sky-300 bg-sky-50 text-sky-700 ring-sky-400",
                2: "border-violet-300 bg-violet-50 text-violet-700 ring-violet-400",
                3: "border-emerald-300 bg-emerald-50 text-emerald-700 ring-emerald-400",
              };
              const active = listaPrecios === lista;
              return (
                <button
                  key={lista}
                  type="button"
                  onClick={() => setListaPrecios(lista)}
                  className={cn(
                    "rounded-xl border px-4 py-2 text-sm font-semibold transition",
                    colors[lista],
                    active ? "ring-2" : "opacity-50 hover:opacity-80"
                  )}
                >
                  Lista {lista}
                </button>
              );
            })}
          </div>
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

        <div className={cn("PedidoFormOptionGrid", styles.PedidoFormOptionGrid)}>
          {prioridadCards.map((item) => (
            <label
              key={item.value}
              className={cn(
                "rounded-2xl border p-4 text-sm",
                item.tone,
                state.values.prioridad === item.value && "ring-2 ring-[var(--color-accent-soft)]"
              )}
            >
              <input
                type="radio"
                name="prioridad"
                value={item.value}
                defaultChecked={state.values.prioridad === item.value}
                className="sr-only"
              />
              <span className="font-semibold text-[var(--color-foreground)]">
                {item.label}
              </span>
            </label>
          ))}
        </div>

        <EstadoStepper
          mode="form"
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

      {state.error ? (
        <section className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {state.error}
        </section>
      ) : null}

      <div className={cn("PedidoFormActions", styles.PedidoFormActions)}>
        <button
          type="submit"
          className={buttonStyles({ className: "w-full sm:w-auto" })}
          disabled={isPending}
        >
          {isPending ? "Guardando pedido..." : "Guardar pedido"}
        </button>
        <Link
          href="/pedidos"
          className={buttonStyles({ variant: "secondary", className: "w-full sm:w-auto" })}
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
