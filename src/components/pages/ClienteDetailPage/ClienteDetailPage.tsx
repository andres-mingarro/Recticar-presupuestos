import Link from "next/link";
import { cn } from "@/lib/cn";
import type { ClienteDetail, ClientePedidoItem } from "@/lib/types";
import { formatDate, getVehicleLabel } from "@/lib/format";
import { ClienteForm, type ClienteFormState } from "@/components/forms/ClienteForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { buttonStyles } from "@/components/ui/Button";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import styles from "./ClienteDetailPage.module.scss";

type ClienteDetailPageProps = {
  cliente: ClienteDetail;
  action: (
    state: ClienteFormState,
    formData: FormData
  ) => Promise<ClienteFormState>;
  initialState: ClienteFormState;
  wasUpdated: boolean;
  pedidosVigentes: ClientePedidoItem[];
  pedidosFinalizados: ClientePedidoItem[];
};

function PedidoCard({ pedido }: { pedido: ClientePedidoItem }) {
  return (
    <Link
      href={`/pedidos/${pedido.id}`}
      className={cn(
        "ClienteDetailPagePedidoCard",
        styles.ClienteDetailPagePedidoCard,
        "block rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition hover:border-[var(--color-accent-soft)] hover:shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
            Pedido #{pedido.numero_pedido}
          </p>
          <h3 className="mt-2 text-base font-semibold text-[var(--color-foreground)]">
            {getVehicleLabel([
              pedido.marca_nombre,
              pedido.modelo_nombre,
              pedido.motor_nombre,
            ])}
          </h3>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge estado={pedido.estado} />
          <PriorityBadge prioridad={pedido.prioridad} />
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-[var(--color-foreground-muted)]">
        <p>
          <span className="font-medium text-[var(--color-foreground)]">
            Serie:
          </span>{" "}
          {pedido.numero_serie_motor || "Sin serie"}
        </p>
        <p>
          <span className="font-medium text-[var(--color-foreground)]">
            Creado:
          </span>{" "}
          {formatDate(pedido.fecha_creacion)}
        </p>
        {pedido.fecha_aprobacion ? (
          <p>
            <span className="font-medium text-[var(--color-foreground)]">
              Aprobado:
            </span>{" "}
            {formatDate(pedido.fecha_aprobacion)}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

export function ClienteDetailPage({
  cliente,
  action,
  initialState,
  wasUpdated,
  pedidosVigentes,
  pedidosFinalizados,
}: ClienteDetailPageProps) {
  return (
    <div className={cn("ClienteDetailPage", styles.ClienteDetailPage, "space-y-6")}>
      <PageHeader
        eyebrow="Clientes"
        title={`${cliente.apellido}, ${cliente.nombre}`}
        description="Editá los datos de contacto del cliente y consultá sus pedidos vigentes o el historial finalizado desde la misma ficha."
        actions={
          <Link href="/clientes" className={buttonStyles({ variant: "secondary" })}>
            Volver al listado
          </Link>
        }
      />

      {wasUpdated ? (
        <section className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          Los datos del cliente se actualizaron correctamente.
        </section>
      ) : null}

      <div
        className={cn(
          "ClienteDetailPageGrid",
          styles.ClienteDetailPageGrid
        )}
      >
        <div
          className={cn(
            "ClienteDetailPageMain",
            styles.ClienteDetailPageMain
          )}
        >
          <section className="rounded-[28px] border border-[var(--color-border)] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <ClienteForm
              action={action}
              initialState={initialState}
              eyebrow="Vista rápida"
              title="Datos actuales"
              submitLabel="Guardar cambios"
              pendingLabel="Guardando cambios..."
              cancelLabel="Cancelar"
              startInReadOnly
              cancelMode="toggle"
            />
          </section>

          <section className="rounded-[28px] border border-[var(--color-border)] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                Trabajos pendientes
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--color-foreground)]">
                Pedidos vigentes
              </h2>
            </div>

            <div
              className={cn(
                "ClienteDetailPagePedidoList",
                styles.ClienteDetailPagePedidoList
              )}
            >
              {pedidosVigentes.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-sm text-[var(--color-foreground-muted)]">
                  Este cliente no tiene pedidos pendientes ni aprobados.
                </div>
              ) : (
                pedidosVigentes.map((pedido) => (
                  <PedidoCard key={pedido.id} pedido={pedido} />
                ))
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-[var(--color-border)] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                Historial
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--color-foreground)]">
                Pedidos finalizados
              </h2>
            </div>

            <div
              className={cn(
                "ClienteDetailPagePedidoList",
                styles.ClienteDetailPagePedidoList
              )}
            >
              {pedidosFinalizados.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-sm text-[var(--color-foreground-muted)]">
                  Todavía no hay pedidos finalizados para este cliente.
                </div>
              ) : (
                pedidosFinalizados.map((pedido) => (
                  <PedidoCard key={pedido.id} pedido={pedido} />
                ))
              )}
            </div>
          </section>
        </div>

        <section className="space-y-4">
          <article className="rounded-[28px] border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(255,247,237,0.9),rgba(255,255,255,0.98))] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
              Resumen
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--color-foreground-muted)]">
              Alta registrada el {formatDate(cliente.fecha_alta)}. Desde esta
              ficha ya podés mantener actualizados los datos de contacto y ver
              los pedidos asociados del cliente.
            </p>
          </article>

          <article className="rounded-[28px] border border-[var(--color-border)] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
              Estado comercial
            </p>
            <div className="mt-4 grid gap-4">
              <div className="rounded-2xl bg-[var(--color-surface)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-foreground-subtle)]">
                  Pedidos vigentes
                </p>
                <p className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">
                  {pedidosVigentes.length}
                </p>
              </div>
              <div className="rounded-2xl bg-[var(--color-surface)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-foreground-subtle)]">
                  Finalizados
                </p>
                <p className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">
                  {pedidosFinalizados.length}
                </p>
              </div>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
