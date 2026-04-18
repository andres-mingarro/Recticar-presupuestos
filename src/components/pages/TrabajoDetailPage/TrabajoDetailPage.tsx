"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import type {
  Marca,
  Modelo,
  ModeloMotorRelation,
  Motor,
  TrabajoDetail,
  RepuestoAgrupado,
  TrabajoAgrupado,
} from "@/lib/types";
import {
  TrabajoClienteSection,
  TrabajoForm,
  type TrabajoFormState,
} from "@/components/forms/TrabajoForm";
import { Button } from "@/components/ui/Button";
import { CobradoProvider, CobradoToggle } from "@/components/ui/CobradoToggle";
import { EstadoStepper } from "@/components/ui/EstadoStepper";
import {
  PrioridadProvider,
  PrioridadToggle,
  usePrioridad,
} from "@/components/ui/PrioridadSelector";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { TrabajosSeleccionProvider } from "@/components/forms/TrabajoForm/TrabajosSeleccionContext";
import { RepuestosSeleccionProvider } from "@/components/forms/TrabajoForm/RepuestosSeleccionContext";
import { getVehicleLabel } from "@/lib/format";
import { Spinner } from "@/components/ui/Spinner";
import { PulsatingButton } from "@/components/ui/PulsatingButton";
import { useCobrado } from "@/components/ui/CobradoToggle/CobradoContext";
import { TrabajoDatosCard } from "@/components/ui/TrabajoDatosCard";
import { PrintButton } from "./PrintButton";
import styles from "./TrabajoDetailPage.module.scss";

type TrabajoDetailPageProps = {
  trabajo: TrabajoDetail;
  action: (
    state: TrabajoFormState,
    formData: FormData
  ) => Promise<TrabajoFormState>;
  initialState: TrabajoFormState;
  wasCreated: boolean;
  wasUpdated: boolean;
  marcas: Marca[];
  modelos: Modelo[];
  motores: Motor[];
  relations: ModeloMotorRelation[];
  trabajos: TrabajoAgrupado[];
  repuestos: RepuestoAgrupado[];
  qrSvg: string;
};

export function TrabajoDetailPage({
  trabajo,
  action,
  initialState,
  wasCreated,
  wasUpdated,
  marcas,
  modelos,
  motores,
  relations,
  trabajos,
  repuestos,
  qrSvg,
}: TrabajoDetailPageProps) {
  const formId = `trabajo-form-${trabajo.id}`;
  const [formState, formAction, isPending] = useActionState(action, initialState);
  const [dirty, setDirty] = useState(false);
  const [selectedEstado, setSelectedEstado] = useState(trabajo.estado);
  const lastSuccessfulUpdatedAtRef = useRef(initialState.values.updatedAt ?? "");

  useEffect(() => {
    if (isPending) setDirty(false);
  }, [isPending]);

  useEffect(() => {
    setSelectedEstado(formState.values.estado);
  }, [formState.values.estado]);

  useEffect(() => {
    if (!wasCreated && !wasUpdated) return;

    toast.success(
      wasCreated
        ? `Trabajo #${trabajo.numero_trabajo} creado correctamente.`
        : `Trabajo #${trabajo.numero_trabajo} guardado correctamente.`
    );

    const url = new URL(window.location.href);
    url.searchParams.delete("created");
    url.searchParams.delete("updated");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, [trabajo.numero_trabajo, wasCreated, wasUpdated]);

  useEffect(() => {
    if (isPending) return;

    const currentUpdatedAt = formState.values.updatedAt ?? "";
    if (!currentUpdatedAt) return;
    if (formState.error) return;
    if (currentUpdatedAt === lastSuccessfulUpdatedAtRef.current) return;

    lastSuccessfulUpdatedAtRef.current = currentUpdatedAt;
    toast.success(`Trabajo #${trabajo.numero_trabajo} guardado correctamente.`);
  }, [formState.error, formState.values.updatedAt, isPending, trabajo.numero_trabajo]);

  return (
    <PrioridadProvider initialValue={trabajo.prioridad}>
    <CobradoProvider initialValue={trabajo.cobrado}>
    <RepuestosSeleccionProvider
      initialItems={trabajo.repuestos.map((repuesto) => ({
        repuestoId: Number(repuesto.repuestoId),
        precioUnitario: repuesto.precioUnitario,
        cantidad: repuesto.cantidad,
      }))}
    >
    <div className={cn("TrabajoDetailPage", styles.TrabajoDetailPage, "space-y-6")}>
      {/* Top bar: back button + save */}
      <div className="flex flex-wrap  lg:flex-nowrap flex-col gap-3 flex-row sm:items-center">
        <Button
          as="a"
          href="/trabajos"
          variant="secondary"
          className="flex-1 lg:flex-none sm:w-auto"
          icon={<Icon name="chevronLeft" className="h-4 w-4" />}
        >
          Volver al listado
        </Button>

        <PulsatingButton
          type="submit"
          form={formId}
          disabled={isPending}
          pulsing={dirty && !isPending}
          className="flex-1 lg:flex-none  sm:w-auto gap-2"
        >
          {isPending ? <Spinner className="h-4 w-4" /> : null}
          {isPending ? "Guardando..." : "Guardar trabajo"}
        </PulsatingButton>
        <div className="block w-full lg:hidden flex flex-col gap-3 flex-row sm:items-center">
          <Button
            as="a"
            href={`/api/trabajos/${trabajo.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-red-600 hover:bg-red-700 focus-visible:ring-red-600 !text-white"
            icon={<Icon name="download" className="h-4 w-4" />}
          >
            DESCARGAR PRESUPUESTO
          </Button>
        </div>
      </div>



      <TrabajosSeleccionProvider initialIds={trabajo.trabajos_ids} initialListaPrecios={(trabajo.lista_precio as 1 | 2 | 3) ?? 1}>
      <div className={cn("TrabajoDetailPageContent", styles.TrabajoDetailPageContent)}>
        <div className={cn("TrabajoDetailPageMain", styles.TrabajoDetailPageMain)}>
          <Card as="section" className="space-y-5">
            {/* Title row */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                  Trabajo #{trabajo.numero_trabajo}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
                    {trabajo.cliente_nombre ?? "Sin cliente"}
                  </h1>
                  {trabajo.cliente_id ? (
                    <Button
                      as="a"
                      href={`/clientes/${trabajo.cliente_id}`}
                      variant="secondary"
                      size="sm"
                      className="shrink-0"
                      icon={<Icon name="idCard" className="h-3.5 w-3.5" />}
                    >
                      Ficha
                    </Button>
                  ) : null}
                </div>
              </div>
              {!trabajo.cliente_id ? (
                <span className="text-sm text-[var(--color-foreground-muted)]">Sin cliente asignado</span>
              ) : null}
            </div>

            {/* Cobrado + Prioridad */}
            <div className="flex gap-3 flex-col md:flex-row" onClickCapture={() => setDirty(true)}>
              <CobradoToggle form={formId} />
              <PrioridadToggle form={formId} />
            </div>

            {/* Estado stepper */}
            <div onClickCapture={() => setDirty(true)}>
              <EstadoStepper
                name="estado"
                initialValue={trabajo.estado}
                value={selectedEstado}
                onChange={setSelectedEstado}
                form={formId}
              />
            </div>
          </Card>

          <div onInput={() => setDirty(true)}>
          <TrabajoForm
            formId={formId}
            action={action}
            initialState={initialState}
            externalFormAction={formAction}
            externalState={formState}
            externalIsPending={isPending}
            initialClienteLabel={trabajo.cliente_nombre ?? ""}
            marcas={marcas}
            modelos={modelos}
            motores={motores}
            relations={relations}
            trabajos={trabajos}
            repuestos={repuestos}
            allowFinalizado
            showClienteSection={false}
            showPrioridadSection={false}
          />
          </div>
        </div>

        <aside className={cn("TrabajoDetailPageSidebar", styles.TrabajoDetailPageSidebar)}>
          <Card as="section" className="flex flex-col gap-3">
            <Button
              as="a"
              href={`/api/trabajos/${trabajo.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-red-600 hover:bg-red-700 focus-visible:ring-red-600 !text-white"
              icon={<Icon name="download" className="h-4 w-4" />}
            >
              DESCARGAR PRESUPUESTO
            </Button>

            {/* Etiqueta QR */}
            <div id="etiqueta-qr-print" className={styles.etiquetaWrapper}>
              <div className={styles.etiqueta}>
                <div
                  className={styles.etiquetaQr}
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: SVG generado internamente
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
                <div className={styles.etiquetaInfo}>
                  <p className={styles.etiquetaNumero}>#{trabajo.numero_trabajo}</p>
                  <p className={styles.etiquetaCliente}>{trabajo.cliente_nombre ?? "Sin cliente"}</p>
                  {getVehicleLabel([trabajo.marca_nombre, trabajo.modelo_nombre, trabajo.motor_nombre]) ? (
                    <>
                    <p className={styles.etiquetaVehiculo}>
                      {getVehicleLabel([trabajo.marca_nombre, trabajo.modelo_nombre])}
                    </p>
                    <p className={styles.etiquetaVehiculo}>
                      {getVehicleLabel([trabajo.motor_nombre])}
                    </p>
                    </>
                  ) : null}
                </div>
              </div>
            </div>

            <PrintButton />
          </Card>

          <TrabajoDetailSummaryCard
            estado={selectedEstado}
            trabajo={trabajo}
            trabajos={trabajos}
            repuestos={repuestos}
          />

          <TrabajoClienteSection
            initialClienteId={initialState.values.clienteId}
            initialClienteLabel={trabajo.cliente_nombre ?? ""}
            formId={formId}
          />

          <section className="rounded-[28px] border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(255,247,237,0.9),rgba(255,255,255,0.98))] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
              Reglas de estado
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--color-foreground-muted)]">
              <li>Aprobado requiere cliente asignado y registra la fecha automáticamente.</li>
              <li>Finalizado mueve el trabajo al historial del cliente.</li>
              <li>La fecha de aprobación se guarda la primera vez que se aprueba.</li>
            </ul>
          </section>
        </aside>
      </div>
      </TrabajosSeleccionProvider>
    </div>
    </RepuestosSeleccionProvider>
    </CobradoProvider>
    </PrioridadProvider>
  );
}

function TrabajoDetailSummaryCard({
  estado,
  trabajo,
  trabajos,
  repuestos,
}: {
  estado: TrabajoDetail["estado"];
  trabajo: TrabajoDetail;
  trabajos: TrabajoAgrupado[];
  repuestos: RepuestoAgrupado[];
}) {
  const { cobrado } = useCobrado();
  const { prioridad } = usePrioridad();

  return (
    <TrabajoDatosCard
      estado={estado}
      cobrado={cobrado}
      prioridad={prioridad}
      marcaNombre={trabajo.marca_nombre}
      modeloNombre={trabajo.modelo_nombre}
      motorNombre={trabajo.motor_nombre}
      numeroSerieMotor={trabajo.numero_serie_motor}
      fechaCreacion={trabajo.fecha_creacion}
      fechaAprobacion={trabajo.fecha_aprobacion}
      trabajos={trabajos}
      repuestos={repuestos}
    />
  );
}
