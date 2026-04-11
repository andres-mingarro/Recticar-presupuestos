"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useActionState } from "react";
import { cn } from "@/lib/cn";
import type {
  ClienteListItem,
  Marca,
  Modelo,
  ModeloMotorRelation,
  Motor,
  PedidoFormValues,
  PedidoPrioridad,
  TrabajoAgrupado,
} from "@/lib/types";
import { buttonStyles } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
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
  clientes: ClienteListItem[];
  marcas: Marca[];
  modelos: Modelo[];
  motores: Motor[];
  relations: ModeloMotorRelation[];
  trabajos: TrabajoAgrupado[];
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
  clientes,
  marcas,
  modelos,
  motores,
  relations,
  trabajos,
}: PedidoFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
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

        <label className={cn("PedidoFormField", styles.PedidoFormField)}>
          <span className="text-sm font-medium text-[var(--color-foreground)]">
            Cliente asociado
          </span>
          <Select name="clienteId" defaultValue={state.values.clienteId}>
            <option value="">Sin cliente asignado</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                #{cliente.numero_cliente} · {cliente.apellido}, {cliente.nombre}
              </option>
            ))}
          </Select>
        </label>
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

        <div className={cn("PedidoFormChecklist", styles.PedidoFormChecklist)}>
          {trabajos.map((grupo) => (
            <details
              key={grupo.categoriaId}
              open
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            >
              <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--color-foreground)]">
                {grupo.categoriaNombre}
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
                      className="mt-0.5 h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-accent)]"
                    />
                    <span>{trabajo.nombre}</span>
                  </label>
                ))}
              </div>
            </details>
          ))}
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

        <div className={cn("PedidoFormOptionGrid", styles.PedidoFormOptionGrid)}>
          {[
            {
              value: "pendiente",
              label: "Pendiente",
              description: "Puede guardarse con o sin cliente asignado.",
            },
            {
              value: "aprobado",
              label: "Aprobado",
              description: "Requiere cliente asignado y registra fecha de aprobacion.",
            },
          ].map((item) => (
            <label
              key={item.value}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm"
            >
              <input
                type="radio"
                name="estado"
                value={item.value}
                defaultChecked={state.values.estado === item.value}
                className="sr-only"
              />
              <span className="font-semibold text-[var(--color-foreground)]">
                {item.label}
              </span>
              <p className="mt-2 text-[var(--color-foreground-muted)]">
                {item.description}
              </p>
            </label>
          ))}
        </div>

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
        <button type="submit" className={buttonStyles()} disabled={isPending}>
          {isPending ? "Guardando pedido..." : "Guardar pedido"}
        </button>
        <Link href="/pedidos" className={buttonStyles({ variant: "secondary" })}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
