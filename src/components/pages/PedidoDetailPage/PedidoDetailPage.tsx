import Link from "next/link";
import { cn } from "@/lib/cn";
import type {
  Marca,
  Modelo,
  ModeloMotorRelation,
  Motor,
  PedidoDetail,
  TrabajoAgrupado,
} from "@/lib/types";
import { PedidoForm, type PedidoFormState } from "@/components/forms/PedidoForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { buttonStyles } from "@/components/ui/Button";
import {
  EstadoStepperAction,
  type ChangeEstadoActionState,
} from "@/components/ui/EstadoStepper";
import {
  PrioridadSelector,
  type ChangePrioridadActionState,
} from "@/components/ui/PrioridadSelector";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { TrabajosResumen } from "@/components/ui/TrabajosResumen/TrabajosResumen";
import { TrabajosSeleccionProvider } from "@/components/forms/PedidoForm/TrabajosSeleccionContext";
import { formatDate, getVehicleLabel } from "@/lib/format";
import styles from "./PedidoDetailPage.module.scss";

type PedidoDetailPageProps = {
  pedido: PedidoDetail;
  action: (
    state: PedidoFormState,
    formData: FormData
  ) => Promise<PedidoFormState>;
  changeEstadoAction: (
    prevState: ChangeEstadoActionState,
    formData: FormData
  ) => Promise<ChangeEstadoActionState>;
  changePrioridadAction: (
    prevState: ChangePrioridadActionState,
    formData: FormData
  ) => Promise<ChangePrioridadActionState>;
  initialState: PedidoFormState;
  wasUpdated: boolean;
  marcas: Marca[];
  modelos: Modelo[];
  motores: Motor[];
  relations: ModeloMotorRelation[];
  trabajos: TrabajoAgrupado[];
};

export function PedidoDetailPage({
  pedido,
  action,
  changeEstadoAction,
  changePrioridadAction,
  initialState,
  wasUpdated,
  marcas,
  modelos,
  motores,
  relations,
  trabajos,
}: PedidoDetailPageProps) {
  return (
    <div className={cn("PedidoDetailPage", styles.PedidoDetailPage, "space-y-6")}>
      {/* Top bar: back button + PDF download */}
      <div className="flex items-center justify-between gap-4">
        <Link href="/pedidos" className={buttonStyles({ variant: "secondary" })}>
          <Icon name="chevronLeft" className="h-4 w-4" />
          Volver al listado
        </Link>

        <a
          href={`/api/pedidos/${pedido.id}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonStyles({ className: "gap-2 bg-red-600 hover:bg-red-700 focus-visible:ring-red-600 !text-white" })}
        >
          <Icon name="download" className="h-4 w-4" />
          DESCARGAR PRESUPUESTO
        </a>
      </div>

      <PageHeader
        eyebrow="Pedidos"
        title={
          <span className="flex w-full items-center justify-between gap-4">
            <span>
              {pedido.cliente_nombre ?? "Sin cliente"} | Pedido #{pedido.numero_pedido}
            </span>
            {pedido.cliente_id ? (
              <Link
                href={`/clientes/${pedido.cliente_id}`}
                className="inline-flex items-center gap-1 shrink-0 text-sm font-medium text-[var(--color-accent)] underline underline-offset-4 transition-opacity hover:opacity-70"
              >
                Ver ficha del cliente
                <Icon name="arrowRight" className="h-3.5 w-3.5" />
              </Link>
            ) : null}
          </span>
        }
        description={
          <div className="space-y-3 pt-1">
            <EstadoStepperAction
              value={pedido.estado}
              action={changeEstadoAction}
            />
            {!pedido.cliente_id ? (
              <span className="text-sm text-[var(--color-foreground-muted)]">
                Sin cliente asignado
              </span>
            ) : null}
          </div>
        }
      />

      {wasUpdated ? (
        <section className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          Los cambios del pedido se guardaron correctamente.
        </section>
      ) : null}

      <TrabajosSeleccionProvider initialIds={pedido.trabajos_ids}>
      <div className={cn("PedidoDetailPageContent", styles.PedidoDetailPageContent)}>
        <PedidoForm
          action={action}
          initialState={initialState}
          initialClienteLabel={pedido.cliente_nombre ?? ""}
          marcas={marcas}
          modelos={modelos}
          motores={motores}
          relations={relations}
          trabajos={trabajos}
          allowFinalizado
        />

        <aside className={cn("PedidoDetailPageSidebar", styles.PedidoDetailPageSidebar)}>
          <Card as="section" className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
              Datos del pedido
            </p>

            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="flex items-center gap-2 text-[var(--color-foreground-muted)]">
                  <Icon name="gauge" className="h-4 w-4 shrink-0" />
                  Prioridad
                </dt>
                <dd>
                  <PrioridadSelector value={pedido.prioridad} action={changePrioridadAction} />
                </dd>
              </div>

              <div className="flex items-center justify-between gap-4">
                <dt className="flex items-center gap-2 text-[var(--color-foreground-muted)]">
                  <Icon name="car" className="h-4 w-4 shrink-0" />
                  Vehículo
                </dt>
                <dd className="text-right font-medium text-[var(--color-foreground)]">
                  {getVehicleLabel([pedido.marca_nombre, pedido.modelo_nombre, pedido.motor_nombre])}
                </dd>
              </div>

              {pedido.numero_serie_motor ? (
                <div className="flex items-center justify-between gap-4">
                  <dt className="flex items-center gap-2 text-[var(--color-foreground-muted)]">
                    <Icon name="hash" className="h-4 w-4 shrink-0" />
                    Serie
                  </dt>
                  <dd className="font-medium text-[var(--color-foreground)]">
                    {pedido.numero_serie_motor}
                  </dd>
                </div>
              ) : null}

              <div className="flex items-center justify-between gap-4">
                <dt className="flex items-center gap-2 text-[var(--color-foreground-muted)]">
                  <Icon name="calendar" className="h-4 w-4 shrink-0" />
                  Creación
                </dt>
                <dd className="font-medium text-[var(--color-foreground)]">
                  {formatDate(pedido.fecha_creacion)}
                </dd>
              </div>

              {pedido.fecha_aprobacion ? (
                <div className="flex items-center justify-between gap-4">
                  <dt className="flex items-center gap-2 text-[var(--color-foreground-muted)]">
                    <Icon name="calendar" className="h-4 w-4 shrink-0" />
                    Aprobación
                  </dt>
                  <dd className="font-medium text-[var(--color-foreground)]">
                    {formatDate(pedido.fecha_aprobacion)}
                  </dd>
                </div>
              ) : null}

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <dt className="flex items-center gap-2 text-[var(--color-foreground-muted)]">
                    <Icon name="clipboard" className="h-4 w-4 shrink-0" />
                    Trabajos
                  </dt>
                </div>
                <TrabajosResumen trabajos={trabajos} />
              </div>
            </dl>
          </Card>

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
  );
}
