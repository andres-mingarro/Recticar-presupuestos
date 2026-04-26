"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import type {
  Marca,
  Modelo,
  ModeloMotorRelation,
  Motor,
  RepuestoAgrupado,
  TrabajoAgrupado,
} from "@/lib/types";
import {
  TrabajoForm,
  type TrabajoFormState,
  type TrabajoFormSummary,
} from "@/components/forms/TrabajoForm";
import { TrabajosSeleccionProvider } from "@/components/forms/TrabajoForm/TrabajosSeleccionContext";
import { RepuestosSeleccionProvider } from "@/components/forms/TrabajoForm/RepuestosSeleccionContext";
import { IvaProvider } from "@/components/ui/IvaToggle";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EstadoStepper } from "@/components/ui/EstadoStepper";
import { PrioridadProvider, PrioridadToggle, usePrioridad } from "@/components/ui/PrioridadSelector";
import { TrabajoDatosCard } from "@/components/ui/TrabajoDatosCard";
import styles from "./NuevoTrabajoPage.module.scss";

type NuevoTrabajoPageProps = {
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
};

export function NuevoTrabajoPage({
  action,
  initialState,
  initialClienteLabel = "",
  marcas,
  modelos,
  motores,
  relations,
  trabajos,
  repuestos,
}: NuevoTrabajoPageProps) {
  const formId = "nuevo-trabajo-form";
  const [state, formAction, isPending] = useActionState(action, initialState);
  const createdAt = useMemo(() => new Date().toISOString(), []);
  const [selectedEstado, setSelectedEstado] = useState(initialState.values.estado);
  const [summary, setSummary] = useState<TrabajoFormSummary>({
    clienteLabel: initialClienteLabel,
    marcaNombre:
      marcas.find((marca) => String(marca.id) === initialState.values.marcaId)?.nombre ?? null,
    modeloNombre:
      modelos.find((modelo) => String(modelo.id) === initialState.values.modeloId)?.nombre ?? null,
    motorNombre:
      motores.find((motor) => String(motor.id) === initialState.values.motorId)?.nombre ?? null,
    numeroSerieMotor: initialState.values.numeroSerieMotor,
    prioridad: initialState.values.prioridad,
    estado: initialState.values.estado,
  });

  useEffect(() => {
    setSelectedEstado(state.values.estado);
  }, [state.values.estado]);

  return (
    <div className={cn("NuevoTrabajoPage", styles.NuevoTrabajoPage, "space-y-6")}>
      <PageHeader
        eyebrow="Trabajos"
        title="Nuevo trabajo"
      />

      <div
        className={cn(
          "NuevoTrabajoPageContent",
          styles.NuevoTrabajoPageContent
        )}
      >
        <PrioridadProvider initialValue={initialState.values.prioridad}>
        <IvaProvider initialValue={initialState.values.aplicaIva ?? true}>
        <TrabajosSeleccionProvider initialIds={[]} initialListaPrecios={initialState.values.listaPrecios}>
          <RepuestosSeleccionProvider initialItems={[]}>
            <NuevoTrabajoPageContent
              formAction={formAction}
              formId={formId}
              state={state}
              isPending={isPending}
              selectedEstado={selectedEstado}
              setSelectedEstado={setSelectedEstado}
              initialClienteLabel={initialClienteLabel}
              marcas={marcas}
              modelos={modelos}
              motores={motores}
              relations={relations}
              trabajos={trabajos}
              repuestos={repuestos}
              createdAt={createdAt}
              summary={summary}
              setSummary={setSummary}
            />
          </RepuestosSeleccionProvider>
        </TrabajosSeleccionProvider>
        </IvaProvider>
        </PrioridadProvider>
      </div>
    </div>
  );
}

function NuevoTrabajoPageContent({
  formAction,
  formId,
  state,
  isPending,
  selectedEstado,
  setSelectedEstado,
  initialClienteLabel,
  marcas,
  modelos,
  motores,
  relations,
  trabajos,
  repuestos,
  createdAt,
  summary,
  setSummary,
}: {
  formAction: (payload: FormData) => void;
  formId: string;
  state: TrabajoFormState;
  isPending: boolean;
  selectedEstado: TrabajoFormState["values"]["estado"];
  setSelectedEstado: (value: TrabajoFormState["values"]["estado"]) => void;
  initialClienteLabel: string;
  marcas: Marca[];
  modelos: Modelo[];
  motores: Motor[];
  relations: ModeloMotorRelation[];
  trabajos: TrabajoAgrupado[];
  repuestos: RepuestoAgrupado[];
  createdAt: string;
  summary: TrabajoFormSummary;
  setSummary: (summary: TrabajoFormSummary) => void;
}) {
  const { prioridad } = usePrioridad();

  return (
    <>
      <div className={cn("NuevoTrabajoPageMain", styles.NuevoTrabajoPageMain, "space-y-4")}>
        <Card as="section" className="space-y-4">
          <div
            className="grid grid-cols-1 gap-3"
          >
            <PrioridadToggle form={formId} />
          </div>

          <EstadoStepper
            name="estado"
            initialValue={state.values.estado}
            value={selectedEstado}
            onChange={setSelectedEstado}
            form={formId}
          />
        </Card>

        <TrabajoForm
          formId={formId}
          formAction={formAction}
          state={state}
          isPending={isPending}
          initialClienteLabel={initialClienteLabel}
          marcas={marcas}
          modelos={modelos}
          motores={motores}
          relations={relations}
          trabajos={trabajos}
          repuestos={repuestos}
          prioridadValue={prioridad}
          estadoValue={selectedEstado}
          showPrioridadSection={false}
          onSummaryChange={setSummary}
        />
      </div>

      <aside
        className={cn(
          "NuevoTrabajoPageSidebar",
          styles.NuevoTrabajoPageSidebar
        )}
      >
        <TrabajoDatosCard
          estado={summary.estado}
          cobrado={false}
          prioridad={summary.prioridad}
          marcaNombre={summary.marcaNombre}
          modeloNombre={summary.modeloNombre}
          motorNombre={summary.motorNombre}
          numeroSerieMotor={summary.numeroSerieMotor}
          fechaCreacion={createdAt}
          trabajos={trabajos}
          repuestos={repuestos}
        />

        <section className="rounded-[28px] border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(255,247,237,0.9),rgba(255,255,255,0.98))] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
            Reglas clave
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--text-color-gray)]">
            <li>Todo trabajo nuevo arranca como `presupuesto entregado`.</li>
            <li>Ese estado representa que el presupuesto ya fue entregado y ahora se espera la respuesta del cliente.</li>
            <li>Si lo marcás como aprobado, el cliente es obligatorio.</li>
            <li>La fecha de aprobacion se registra automaticamente.</li>
          </ul>
        </section>

        <Card as="section">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
            Proximo paso
          </p>
          <p className="mt-3 text-sm leading-6 text-[var(--text-color-gray)]">
            Después de crear el trabajo, lo vamos a usar como base para la
            edición completa, la aprobacion, el PDF y el link de WhatsApp.
          </p>
        </Card>
      </aside>
    </>
  );
}
