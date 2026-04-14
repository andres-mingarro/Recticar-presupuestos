"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import type {
  Marca,
  Modelo,
  ModeloMotorRelation,
  Motor,
  PedidoDetail,
  RepuestoAgrupado,
  TrabajoAgrupado,
} from "@/lib/types";
import {
  PedidoClienteSection,
  PedidoForm,
  type PedidoFormState,
} from "@/components/forms/PedidoForm";
import { buttonStyles } from "@/components/ui/Button";
import { CobradoProvider, CobradoToggle } from "@/components/ui/CobradoToggle";
import { EstadoStepper } from "@/components/ui/EstadoStepper";
import {
  PrioridadProvider,
  PrioridadToggle,
  usePrioridad,
} from "@/components/ui/PrioridadSelector";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { TrabajosSeleccionProvider } from "@/components/forms/PedidoForm/TrabajosSeleccionContext";
import { RepuestosSeleccionProvider } from "@/components/forms/PedidoForm/RepuestosSeleccionContext";
import { getVehicleLabel } from "@/lib/format";
import { Spinner } from "@/components/ui/Spinner";
import { PulsatingButton } from "@/components/ui/PulsatingButton";
import { useCobrado } from "@/components/ui/CobradoToggle/CobradoContext";
import { PedidoDatosCard } from "@/components/ui/PedidoDatosCard";
import { PrintButton } from "./PrintButton";
import styles from "./PedidoDetailPage.module.scss";

type PedidoDetailPageProps = {
  pedido: PedidoDetail;
  action: (
    state: PedidoFormState,
    formData: FormData
  ) => Promise<PedidoFormState>;
  initialState: PedidoFormState;
  wasUpdated: boolean;
  marcas: Marca[];
  modelos: Modelo[];
  motores: Motor[];
  relations: ModeloMotorRelation[];
  trabajos: TrabajoAgrupado[];
  repuestos: RepuestoAgrupado[];
  qrSvg: string;
};

export function PedidoDetailPage({
  pedido,
  action,
  initialState,
  wasUpdated,
  marcas,
  modelos,
  motores,
  relations,
  trabajos,
  repuestos,
  qrSvg,
}: PedidoDetailPageProps) {
  const formId = `pedido-form-${pedido.id}`;
  const [formState, formAction, isPending] = useActionState(action, initialState);
  const [dirty, setDirty] = useState(false);
  const [selectedEstado, setSelectedEstado] = useState(pedido.estado);

  useEffect(() => {
    if (isPending) setDirty(false);
  }, [isPending]);

  useEffect(() => {
    setSelectedEstado(formState.values.estado);
  }, [formState.values.estado]);

  return (
    <PrioridadProvider initialValue={pedido.prioridad}>
    <CobradoProvider initialValue={pedido.cobrado}>
    <RepuestosSeleccionProvider
      initialItems={pedido.repuestos.map((repuesto) => ({
        repuestoId: Number(repuesto.repuestoId),
        precioUnitario: repuesto.precioUnitario,
        cantidad: repuesto.cantidad,
      }))}
    >
    <div className={cn("PedidoDetailPage", styles.PedidoDetailPage, "space-y-6")}>
      {/* Top bar: back button + save */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href="/pedidos"
          className={buttonStyles({ variant: "secondary", className: "w-full sm:w-auto" })}
        >
          <Icon name="chevronLeft" className="h-4 w-4" />
          Volver al listado
        </Link>

        <PulsatingButton
          type="submit"
          form={formId}
          disabled={isPending}
          pulsing={dirty && !isPending}
          className="w-full sm:w-auto gap-2"
        >
          {isPending ? <Spinner className="h-4 w-4" /> : null}
          {isPending ? "Guardando..." : "Guardar pedido"}
        </PulsatingButton>
      </div>

      <TrabajosSeleccionProvider initialIds={pedido.trabajos_ids} initialListaPrecios={(pedido.lista_precio as 1 | 2 | 3) ?? 1}>
      <div className={cn("PedidoDetailPageContent", styles.PedidoDetailPageContent)}>
        <div className={cn("PedidoDetailPageMain", styles.PedidoDetailPageMain)}>
          <Card as="section" className="space-y-5">
            {/* Title row */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                  Pedido #{pedido.numero_pedido}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
                    {pedido.cliente_nombre ?? "Sin cliente"}
                  </h1>
                  {pedido.cliente_id ? (
                    <Link
                      href={`/clientes/${pedido.cliente_id}`}
                      className={buttonStyles({ variant: "secondary", size: "sm", className: "gap-1.5 shrink-0" })}
                    >
                      <Icon name="idCard" className="h-3.5 w-3.5" />
                      Ficha
                    </Link>
                  ) : null}
                </div>
              </div>
              {!pedido.cliente_id ? (
                <span className="text-sm text-[var(--color-foreground-muted)]">Sin cliente asignado</span>
              ) : null}
            </div>

            {/* Cobrado + Prioridad */}
            <div className="flex gap-3" onClickCapture={() => setDirty(true)}>
              <CobradoToggle form={formId} />
              <PrioridadToggle form={formId} />
            </div>

            {/* Estado stepper */}
            <div onClickCapture={() => setDirty(true)}>
              <EstadoStepper
                name="estado"
                initialValue={pedido.estado}
                value={selectedEstado}
                onChange={setSelectedEstado}
                form={formId}
              />
            </div>
          </Card>

          {wasUpdated ? (
            <section className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
              Los cambios del pedido se guardaron correctamente.
            </section>
          ) : null}

          <div onInput={() => setDirty(true)}>
          <PedidoForm
            formId={formId}
            action={action}
            initialState={initialState}
            externalFormAction={formAction}
            externalState={formState}
            externalIsPending={isPending}
            initialClienteLabel={pedido.cliente_nombre ?? ""}
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

        <aside className={cn("PedidoDetailPageSidebar", styles.PedidoDetailPageSidebar)}>
          <Card as="section" className="flex flex-col gap-3">
            <a
              href={`/api/pedidos/${pedido.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonStyles({
                className:
                  "w-full gap-2 bg-red-600 hover:bg-red-700 focus-visible:ring-red-600 !text-white",
              })}
            >
              <Icon name="download" className="h-4 w-4" />
              DESCARGAR PRESUPUESTO
            </a>

            {/* Etiqueta QR */}
            <div id="etiqueta-qr-print" className={styles.etiquetaWrapper}>
              <div className={styles.etiqueta}>
                <div
                  className={styles.etiquetaQr}
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: SVG generado internamente
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
                <div className={styles.etiquetaInfo}>
                  <p className={styles.etiquetaNumero}>#{pedido.numero_pedido}</p>
                  <p className={styles.etiquetaCliente}>{pedido.cliente_nombre ?? "Sin cliente"}</p>
                  {getVehicleLabel([pedido.marca_nombre, pedido.modelo_nombre, pedido.motor_nombre]) ? (
                    <p className={styles.etiquetaVehiculo}>
                      {getVehicleLabel([pedido.marca_nombre, pedido.modelo_nombre, pedido.motor_nombre])}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <PrintButton />
          </Card>

          <PedidoDetailSummaryCard
            estado={selectedEstado}
            pedido={pedido}
            trabajos={trabajos}
            repuestos={repuestos}
          />

          <PedidoClienteSection
            initialClienteId={initialState.values.clienteId}
            initialClienteLabel={pedido.cliente_nombre ?? ""}
            formId={formId}
          />

          <section className="rounded-[28px] border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(255,247,237,0.9),rgba(255,255,255,0.98))] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
              Reglas de estado
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--color-foreground-muted)]">
              <li>Aprobado requiere cliente asignado y registra la fecha automáticamente.</li>
              <li>Finalizado mueve el pedido al historial del cliente.</li>
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

function PedidoDetailSummaryCard({
  estado,
  pedido,
  trabajos,
  repuestos,
}: {
  estado: PedidoDetail["estado"];
  pedido: PedidoDetail;
  trabajos: TrabajoAgrupado[];
  repuestos: RepuestoAgrupado[];
}) {
  const { cobrado } = useCobrado();
  const { prioridad } = usePrioridad();

  return (
    <PedidoDatosCard
      estado={estado}
      cobrado={cobrado}
      prioridad={prioridad}
      marcaNombre={pedido.marca_nombre}
      modeloNombre={pedido.modelo_nombre}
      motorNombre={pedido.motor_nombre}
      numeroSerieMotor={pedido.numero_serie_motor}
      fechaCreacion={pedido.fecha_creacion}
      fechaAprobacion={pedido.fecha_aprobacion}
      trabajos={trabajos}
      repuestos={repuestos}
    />
  );
}
