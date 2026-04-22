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
import { useMobileActionsRegister } from "@/components/layout/MobileActions";
import styles from "./TrabajoDetailPage.module.scss";
import type { TrabajoDetalleItem } from "@/lib/queries/catalogo";
import type { RepuestoDetalleItem } from "@/lib/queries/repuestos";

function TrabajoMobileActions({
  formId,
  trabajoId,
  dirty,
  isPending,
}: {
  formId: string;
  trabajoId: number;
  dirty: boolean;
  isPending: boolean;
}) {
  return (
    <>
      <PulsatingButton
        type="submit"
        form={formId}
        disabled={isPending}
        pulsing={dirty && !isPending}
        size="sm"
      >
        {isPending ? <Spinner className="h-3.5 w-3.5" /> : <Icon name="check" className="h-3.5 w-3.5" />}
        {isPending ? "Guardando..." : "Guardar"}
      </PulsatingButton>
      <a
        href={`/api/trabajos/${trabajoId}/pdf`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.1)] text-white text-sm font-semibold"
      >
        <Icon name="download" className="h-3.5 w-3.5" />
        PDF
      </a>
    </>
  );
}

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
  snapshotTrabajos: TrabajoDetalleItem[];
  snapshotRepuestos: RepuestoDetalleItem[];
  refreshSnapshotPricesAction: (
    state: { error: string | null; success: boolean; updatedCount: number },
    formData: FormData
  ) => Promise<{ error: string | null; success: boolean; updatedCount: number }>;
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
  snapshotTrabajos,
  snapshotRepuestos,
  refreshSnapshotPricesAction,
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

  useMobileActionsRegister(
    <TrabajoMobileActions
      formId={formId}
      trabajoId={trabajo.id}
      dirty={dirty}
      isPending={isPending}
    />,
    [dirty, isPending]
  );

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
    <div className={cn("TrabajoDetailPage", styles.TrabajoDetailPage, "space-y-5")}>

      {/* ── Botón guardar ─────────────────────────────────────────── */}
      <div className="hidden md:flex justify-start">
        <PulsatingButton
          type="submit"
          form={formId}
          disabled={isPending}
          pulsing={dirty && !isPending}
          className="gap-2"
        >
          {isPending ? <Spinner className="h-4 w-4" /> : null}
          {isPending ? "Guardando..." : "Guardar trabajo"}
        </PulsatingButton>
      </div>

      <TrabajosSeleccionProvider
        initialIds={trabajo.trabajos_ids}
        initialListaPrecios={(trabajo.lista_precio as 1 | 2 | 3) ?? 1}
      >
      <div className={cn("TrabajoDetailPageContent", styles.TrabajoDetailPageContent)}>

        {/* ── Columna principal ──────────────────────────────────── */}
        <div className={cn("TrabajoDetailPageMain", styles.TrabajoDetailPageMain, "space-y-4")}>

          {/* Card de controles */}
          <Card as="section" className="space-y-4">
            {/* Título */}
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                  Trabajo #{trabajo.numero_trabajo}
                </p>
                <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-[var(--text-color-defult)] truncate">
                  {trabajo.cliente_nombre ?? "Sin cliente asignado"}
                </h1>
              </div>
              {trabajo.cliente_id ? (
                <Button
                  as="a"
                  href={`/clientes/${trabajo.cliente_id}`}
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  icon={<Icon name="idCard" className="h-3.5 w-3.5" />}
                >
                  Ficha
                </Button>
              ) : null}
            </div>

            {/* Cobrado + Prioridad en fila */}
            <div
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
              onClickCapture={() => setDirty(true)}
            >
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

          {/* Formulario */}
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
              snapshotTrabajos={snapshotTrabajos}
              snapshotRepuestos={snapshotRepuestos}
              allowFinalizado
              showClienteSection={false}
              showPrioridadSection={false}
            />
          </div>
        </div>

        {/* ── Sidebar ────────────────────────────────────────────── */}
        <aside className={cn("TrabajoDetailPageSidebar", styles.TrabajoDetailPageSidebar)}>

          {/* PDF + QR */}
          <Card as="section" className="space-y-3">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--color-accent)]">
              Presupuesto
            </p>
            <a
              href={`/api/trabajos/${trabajo.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 hover:border-rose-300"
            >
              <Icon name="download" className="h-4 w-4" />
              Descargar PDF
            </a>

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

          {/* Datos + resumen */}
          <TrabajoDetailSummaryCard
            estado={selectedEstado}
            trabajo={trabajo}
            trabajos={trabajos}
            repuestos={repuestos}
            snapshotTrabajos={snapshotTrabajos}
            snapshotRepuestos={snapshotRepuestos}
            refreshSnapshotPricesAction={refreshSnapshotPricesAction}
          />

          {/* Cliente */}
          <TrabajoClienteSection
            initialClienteId={initialState.values.clienteId}
            initialClienteLabel={trabajo.cliente_nombre ?? ""}
            formId={formId}
          />

          {/* Reglas de estado */}
          <Card as="section" className="space-y-3">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--color-accent)]">
              Reglas de estado
            </p>
            <ul className="space-y-2 text-sm leading-relaxed text-[var(--text-color-gray)]">
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--apricot-light)]" />
                <span><strong className="text-[var(--text-color-defult)]">Presupuesto entregado</strong> — el cliente ya recibió el presupuesto.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--orange-vivid)]" />
                <span><strong className="text-[var(--text-color-defult)]">Aprobado</strong> — requiere cliente asignado, registra fecha automáticamente.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                <span><strong className="text-[var(--text-color-defult)]">Finalizado</strong> — mueve el trabajo al historial del cliente.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-border)]" />
                <span>La fecha de aprobación se guarda solo la primera vez.</span>
              </li>
            </ul>
          </Card>

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
  snapshotTrabajos,
  snapshotRepuestos,
  refreshSnapshotPricesAction,
}: {
  estado: TrabajoDetail["estado"];
  trabajo: TrabajoDetail;
  trabajos: TrabajoAgrupado[];
  repuestos: RepuestoAgrupado[];
  snapshotTrabajos: TrabajoDetalleItem[];
  snapshotRepuestos: RepuestoDetalleItem[];
  refreshSnapshotPricesAction: (
    state: { error: string | null; success: boolean; updatedCount: number },
    formData: FormData
  ) => Promise<{ error: string | null; success: boolean; updatedCount: number }>;
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
      snapshotTrabajos={snapshotTrabajos}
      snapshotRepuestos={snapshotRepuestos}
      refreshSnapshotPricesAction={refreshSnapshotPricesAction}
    />
  );
}
