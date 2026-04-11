import Link from "next/link";
import { cn } from "@/lib/cn";
import {
  PEDIDO_ESTADOS,
  PEDIDO_PRIORIDADES,
  type PedidoEstado,
  type PedidoListItem,
  type PedidoPrioridad,
} from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Table } from "@/components/ui/Table";
import { buttonStyles } from "@/components/ui/Button";
import { formatDate, getVehicleLabel } from "@/lib/format";
import styles from "./PedidosPage.module.scss";

type PedidosPageProps = {
  estado?: PedidoEstado;
  prioridad?: PedidoPrioridad;
  pedidos: PedidoListItem[];
  errorMessage: string | null;
};

export function PedidosPage({
  estado,
  prioridad,
  pedidos,
  errorMessage,
}: PedidosPageProps) {
  return (
    <div className={cn("PedidosPage", styles.PedidosPage, "space-y-6")}>
      <PageHeader
        eyebrow="Pedidos"
        title="Listado de pedidos"
        description="Filtrá presupuestos por estado y prioridad. La base ya queda lista para seguir con alta, edición, aprobación y PDF."
        actions={
          <Link href="/pedidos/nuevo" className={buttonStyles()}>
            Nuevo pedido
          </Link>
        }
      />

      <Card as="section" className="p-5">
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
      </Card>

      {errorMessage ? (
        <section className="rounded-[28px] border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          Error al consultar la base de datos: {errorMessage}
        </section>
      ) : null}

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
            </tr>
          </thead>
          <tbody>
            {pedidos.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-[var(--color-foreground-muted)]"
                >
                  No hay pedidos para mostrar.
                </td>
              </tr>
            ) : (
              pedidos.map((pedido) => (
                <tr
                  key={pedido.id}
                  className="border-t border-[var(--color-border)] text-[var(--color-foreground)]"
                >
                  <td className="px-4 py-4 font-semibold">
                    <Link
                      href={`/pedidos/${pedido.id}`}
                      className="transition hover:text-[var(--color-accent)]"
                    >
                      #{pedido.numero_pedido}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    {pedido.cliente_nombre ?? "Sin cliente asignado"}
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Table>
    </div>
  );
}
