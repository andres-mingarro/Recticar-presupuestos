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
import {
  PedidoClienteSection,
  PedidoForm,
  type PedidoFormState,
} from "@/components/forms/PedidoForm";
import { buttonStyles } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { CobradoBadge, CobradoProvider, CobradoToggle } from "@/components/ui/CobradoToggle";
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
  const formId = `pedido-form-${pedido.id}`;

  return (
    <CobradoProvider initialValue={pedido.cobrado}>
    <div className={cn("PedidoDetailPage", styles.PedidoDetailPage, "space-y-6")}>
      {/* Top bar: back button + PDF download */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/pedidos"
            className={buttonStyles({ variant: "secondary", className: "w-full sm:w-auto" })}
          >
            <Icon name="chevronLeft" className="h-4 w-4" />
            Volver al listado
          </Link>

          <button
            type="submit"
            form={formId}
            className={buttonStyles({ className: "w-full sm:w-auto" })}
          >
            Guardar pedido
          </button>
        </div>

        <a
          href={`/api/pedidos/${pedido.id}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonStyles({
            className:
              "w-full gap-2 bg-red-600 hover:bg-red-700 focus-visible:ring-red-600 !text-white sm:w-auto",
          })}
        >
          <Icon name="download" className="h-4 w-4" />
          DESCARGAR PRESUPUESTO
        </a>
      </div>

      <Card as="section" className="space-y-5">
        {/* Title row */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
              Pedido #{pedido.numero_pedido}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
              {pedido.cliente_nombre ?? "Sin cliente"}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <CobradoToggle form={formId} />
            {pedido.cliente_id ? (
              <Link
                href={`/clientes/${pedido.cliente_id}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-accent)] underline underline-offset-4 transition-opacity hover:opacity-70"
              >
                Ver ficha del cliente
                <Icon name="arrowRight" className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <span className="text-sm text-[var(--color-foreground-muted)]">Sin cliente asignado</span>
            )}
          </div>
        </div>

        {/* Estado stepper */}
        <EstadoStepperAction value={pedido.estado} action={changeEstadoAction} />
      </Card>

      {wasUpdated ? (
        <section className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          Los cambios del pedido se guardaron correctamente.
        </section>
      ) : null}

      <TrabajosSeleccionProvider initialIds={pedido.trabajos_ids} initialListaPrecios={(pedido.lista_precio as 1 | 2 | 3) ?? 1}>
      <div className={cn("PedidoDetailPageContent", styles.PedidoDetailPageContent)}>
        <PedidoForm
          formId={formId}
          action={action}
          initialState={initialState}
          initialClienteLabel={pedido.cliente_nombre ?? ""}
          marcas={marcas}
          modelos={modelos}
          motores={motores}
          relations={relations}
          trabajos={trabajos}
          allowFinalizado
          showClienteSection={false}
          showPrioridadSection={false}
        />

        <aside className={cn("PedidoDetailPageSidebar", styles.PedidoDetailPageSidebar)}>
          <Card as="section" className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
              Datos del pedido
            </p>

            <dl className="space-y-3 text-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <dt className="flex items-center gap-2 text-[var(--color-foreground-muted)]">
                  <Icon name="clipboard" className="h-4 w-4 shrink-0" />
                  Estado
                </dt>
                <dd>
                  <StatusBadge estado={pedido.estado} />
                </dd>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <dt className="flex items-center gap-2 text-[var(--color-foreground-muted)]">
                  <Icon name="check" className="h-4 w-4 shrink-0" />
                  Cobro
                </dt>
                <dd>
                  <CobradoBadge />
                </dd>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <dt className="flex items-center gap-2 text-[var(--color-foreground-muted)]">
                  <Icon name="gauge" className="h-4 w-4 shrink-0" />
                  Prioridad
                </dt>
                <dd>
                  <PrioridadSelector value={pedido.prioridad} action={changePrioridadAction} />
                </dd>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <dt className="flex items-center gap-2 text-[var(--color-foreground-muted)]">
                  <Icon name="car" className="h-4 w-4 shrink-0" />
                  Vehículo
                </dt>
                <dd className="font-medium text-[var(--color-foreground)] sm:text-right">
                  {getVehicleLabel([pedido.marca_nombre, pedido.modelo_nombre, pedido.motor_nombre])}
                </dd>
              </div>

              {pedido.numero_serie_motor ? (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <dt className="flex items-center gap-2 text-[var(--color-foreground-muted)]">
                    <Icon name="hash" className="h-4 w-4 shrink-0" />
                    Serie
                  </dt>
                  <dd className="font-medium text-[var(--color-foreground)]">
                    {pedido.numero_serie_motor}
                  </dd>
                </div>
              ) : null}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <dt className="flex items-center gap-2 text-[var(--color-foreground-muted)]">
                  <Icon name="calendar" className="h-4 w-4 shrink-0" />
                  Creación
                </dt>
                <dd className="font-medium text-[var(--color-foreground)]">
                  {formatDate(pedido.fecha_creacion)}
                </dd>
              </div>

              {pedido.fecha_aprobacion ? (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <dt className="flex items-center gap-2 text-[var(--color-foreground-muted)]">
                    <Icon name="clipboard" className="h-4 w-4 shrink-0" />
                    Trabajos
                  </dt>
                </div>
                <TrabajosResumen trabajos={trabajos} />
              </div>
            </dl>
          </Card>

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
    </CobradoProvider>
  );
}
