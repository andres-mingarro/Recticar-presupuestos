"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import {
  PEDIDO_ESTADOS,
  PEDIDO_PRIORIDADES,
  type PedidoEstado,
  type PedidoListItem,
  type PedidoPrioridad,
} from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  BusinessDaysBadge,
  PriorityBadge,
  StatusBadge,
} from "@/components/ui/Badge";
import { ButtonAdd } from "@/components/ui/ButtonAdd";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Table } from "@/components/ui/Table";
import { buttonStyles } from "@/components/ui/Button";
import {
  formatDate,
  getBusinessDaysBetween,
  getBusinessDaysSince,
  getVehicleLabel,
} from "@/lib/format";
import styles from "./PedidosPage.module.scss";

type PedidosPageProps = {
  estado?: PedidoEstado;
  prioridad?: PedidoPrioridad;
  pedidos: PedidoListItem[];
  errorMessage: string | null;
};

function PedidoTable({
  title,
  eyebrow,
  pedidos,
  emptyMessage,
}: {
  title: string;
  eyebrow: string;
  pedidos: PedidoListItem[];
  emptyMessage: string;
}) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--color-foreground)]">
          {title}
        </h2>
      </div>

      <Table>
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[var(--color-surface-alt)] text-[var(--color-foreground-muted)]">
            <tr>
              <th className="px-4 py-3 font-semibold">N° Pedido</th>
              <th className="px-4 py-3 font-semibold">Cliente</th>
              <th className="px-4 py-3 font-semibold">Vehículo / Motor</th>
              <th className="px-4 py-3 font-semibold">Prioridad</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Creación</th>
              <th className="px-4 py-3 font-semibold">Aprobación</th>
              <th className="px-4 py-3 font-semibold">Días hábiles</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-[var(--color-foreground-muted)]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pedidos.map((pedido) => (
                <tr
                  key={pedido.id}
                  className="cursor-pointer border-t border-[var(--color-border)] text-[var(--color-foreground)] transition hover:bg-[var(--color-surface-alt)] focus-within:bg-[var(--color-surface-alt)]"
                  role="link"
                  tabIndex={0}
                  onClick={() => router.push(`/pedidos/${pedido.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      router.push(`/pedidos/${pedido.id}`);
                    }
                  }}
                >
                  <td className="px-4 py-4 font-semibold">
                    #{pedido.numero_pedido}
                  </td>
                  <td className="px-4 py-4">
                    {pedido.cliente_id ? (
                      <Link
                        href={`/clientes/${pedido.cliente_id}`}
                        className="relative z-[1] font-medium text-[var(--color-accent)] underline decoration-[var(--color-accent)] underline-offset-4 transition hover:text-[var(--color-accent-strong)]"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {pedido.cliente_nombre ?? "Sin cliente asignado"}
                      </Link>
                    ) : (
                      "Sin cliente asignado"
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <p>
                        {getVehicleLabel([
                          pedido.marca_nombre,
                          pedido.modelo_nombre,
                          pedido.motor_nombre,
                        ])}
                      </p>
                      <p className="text-xs text-[var(--color-foreground-muted)]">
                        Serie: {pedido.numero_serie_motor || "Sin serie"}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <PriorityBadge prioridad={pedido.prioridad} />
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge estado={pedido.estado} />
                  </td>
                  <td className="px-4 py-4">
                    {formatDate(pedido.fecha_creacion)}
                  </td>
                  <td className="px-4 py-4">
                    {formatDate(pedido.fecha_aprobacion)}
                  </td>
                  <td className="px-4 py-4">
                    <BusinessDaysBadge
                      days={
                        pedido.estado === "finalizado"
                          ? getBusinessDaysBetween(
                              pedido.fecha_creacion,
                              pedido.fecha_aprobacion ?? pedido.fecha_creacion
                            )
                          : getBusinessDaysSince(pedido.fecha_creacion)
                      }
                      prefix={
                        pedido.estado === "finalizado" ? "Entregado en" : undefined
                      }
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Table>
    </div>
  );
}

export function PedidosPage({
  estado,
  prioridad,
  pedidos,
  errorMessage,
}: PedidosPageProps) {
  const pedidosActivos = pedidos.filter((pedido) => pedido.estado !== "finalizado");
  const pedidosFinalizados = pedidos.filter((pedido) => pedido.estado === "finalizado");

  return (
    <div className={cn("PedidosPage", styles.PedidosPage, "space-y-6")}>
      <PageHeader
        eyebrow="Pedidos"
        title="Listado de pedidos"
        description="Filtrá presupuestos por estado y prioridad. La base ya queda lista para seguir con alta, edición, aprobación y PDF."
        actions={
          <ButtonAdd href="/pedidos/nuevo">Nuevo pedido</ButtonAdd>
        }
      />

      {errorMessage ? (
        <section className="rounded-[28px] border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          Error al consultar la base de datos: {errorMessage}
        </section>
      ) : null}

      <Card as="section" className="space-y-5">
        <form className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto]">
          <Select name="estado" defaultValue={estado ?? ""}>
            <option value="">Todos los estados</option>
            {PEDIDO_ESTADOS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>

          <Select name="prioridad" defaultValue={prioridad ?? ""}>
            <option value="">Todas las prioridades</option>
            {PEDIDO_PRIORIDADES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>

          <button type="submit" className={buttonStyles()}>
            Filtrar
          </button>
          <Link href="/pedidos" className={buttonStyles({ variant: "secondary" })}>
            Limpiar
          </Link>
        </form>

        <PedidoTable
          eyebrow="Activos"
          title="Pedidos activos"
          pedidos={pedidosActivos}
          emptyMessage="No hay pedidos pendientes ni aprobados para mostrar."
        />

        <PedidoTable
          eyebrow="Finalizados"
          title="Pedidos finalizados"
          pedidos={pedidosFinalizados}
          emptyMessage="No hay pedidos finalizados para mostrar."
        />
      </Card>
    </div>
  );
}
