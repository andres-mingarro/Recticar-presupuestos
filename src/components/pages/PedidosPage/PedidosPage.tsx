"use client";

import Link from "next/link";
import { useState } from "react";
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
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import {
  formatDate,
  getBusinessDaysBetween,
  getBusinessDaysSince,
} from "@/lib/format";
import { PedidoMobileCard } from "@/components/ui/PedidoMobileCard";
import styles from "./PedidosPage.module.scss";

type PedidosPageProps = {
  estado?: PedidoEstado;
  prioridad?: PedidoPrioridad;
  numeroPedido?: number;
  pedidos: PedidoListItem[];
  errorMessage: string | null;
  canEdit: boolean;
};

function CobroIcon({ cobrado }: { cobrado: boolean }) {
  return (
    <span
      className={cn(
        "CobroIcon",
        "inline-flex items-center justify-center text-xl",
        cobrado
          ? "text-emerald-600"
          : "text-[var(--color-foreground-subtle)]"
      )}
      aria-label={cobrado ? "Cobrado" : "No cobrado"}
      title={cobrado ? "Cobrado" : "No cobrado"}
    >
      <Icon name={cobrado ? "sackDollar" : "sackXmark"} size="lg" />
    </span>
  );
}

function PedidoTable({
  title,
  eyebrow,
  pedidos,
  emptyMessage,
  showBusinessDays = true,
}: {
  title: string;
  eyebrow: string;
  pedidos: PedidoListItem[];
  emptyMessage: string;
  showBusinessDays?: boolean;
}) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
          {eyebrow}
        </p>
        <h2 className="mt-2 inline-flex items-center gap-2 text-xl font-semibold tracking-tight text-[var(--color-foreground)]">
          <Icon name="clipboard" className="h-5 w-5" />
          {title}
        </h2>
      </div>

      <Table>
        <table className="w-full table-auto text-left text-sm">
          <thead className="bg-[var(--color-surface-alt)] text-[var(--color-foreground-muted)]">
            <tr>
              <th className="w-[56px] px-2 py-3 font-semibold">
                <span className="inline-flex items-center" aria-label="Número de pedido" title="Número de pedido">
                  #
                </span>
              </th>
              <th className="min-w-[80px] px-3 py-3 font-semibold"><span className="inline-flex items-center gap-2"><Icon name="user" className="h-4 w-4" />Cliente</span></th>
              <th className="min-w-[90px] px-3 py-3 font-semibold"><span className="inline-flex items-center gap-2"><Icon name="car" className="h-4 w-4" />Detalle</span></th>
              <th className="w-[96px] px-3 py-3 font-semibold"><span className="inline-flex items-center gap-2"><Icon name="gauge" className="h-4 w-4" />Prioridad</span></th>
              <th className="w-[64px] px-3 py-3 font-semibold">
                <span
                  className="group relative inline-flex items-center"
                  aria-label="Cobro"
                  tabIndex={0}
                >
                  <Icon name="sackDollar" size="xl" />
                  <span
                    className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 rounded-md bg-[var(--color-foreground)] px-2 py-1 text-xs font-semibold text-white opacity-0 shadow-[0_10px_24px_rgba(15,23,42,0.18)] transition group-hover:opacity-100 group-focus-visible:opacity-100"
                    role="tooltip"
                  >
                    Cobro
                  </span>
                </span>
              </th>
              <th className="w-[96px] px-3 py-3 font-semibold"><span className="inline-flex items-center gap-2"><Icon name="clipboard" className="h-4 w-4" />Estado</span></th>
              <th className="w-[146px] px-3 py-3 font-semibold">
                <span className="inline-flex items-center gap-2"><Icon name="calendar" className="h-4 w-4" />Creación / aprobación</span>
              </th>
              {showBusinessDays ? (
                <th className="w-[96px] px-3 py-3 font-semibold whitespace-nowrap"><span className="inline-flex items-center gap-2"><Icon name="clock" className="h-4 w-4" />Días hábiles</span></th>
              ) : (
                <th className="w-[96px] px-3 py-3 font-semibold"></th>
              )}
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
                  <td className="w-[56px] px-2 py-4 font-semibold">
                    #{pedido.numero_pedido}
                  </td>
                  <td className="min-w-[80px] px-3 py-4">
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
                  <td className="min-w-[90px] px-3 py-4">
                    <div className="space-y-1">
                      <p className="text-[0.68rem] font-semibold uppercase leading-none text-[var(--color-foreground-subtle)]">
                        {pedido.marca_nombre ?? "Marca sin definir"}
                      </p>
                      <p className="font-medium">
                        {pedido.modelo_nombre ?? "Modelo sin definir"}
                      </p>
                      <p className="text-xs text-[var(--color-foreground-muted)]">
                        {pedido.motor_nombre ?? "Motor sin definir"}
                      </p>
                    </div>
                  </td>
                  <td className="w-[96px] px-3 py-4">
                    <PriorityBadge prioridad={pedido.prioridad} className="w-full justify-center" />
                  </td>
                  <td className="w-[64px] px-3 py-4">
                    <CobroIcon cobrado={pedido.cobrado} />
                  </td>
                  <td className="w-[96px] px-3 py-4">
                    <StatusBadge estado={pedido.estado} />
                  </td>
                  <td className="w-[146px] px-3 py-4">
                    <div className="inline-flex items-center gap-2 text-[var(--color-foreground-muted)]">
                      <span>{formatDate(pedido.fecha_creacion)}</span>
                      <Icon name="arrowRight" className="h-4 w-4" />
                      <span className="whitespace-nowrap">{pedido.estado === "pendiente" ? "--/--/----" : formatDate(pedido.fecha_aprobacion)}</span>
                    </div>
                  </td>
                  {showBusinessDays ? (
                    <td className="w-[96px] px-3 py-4 text-center">
                      <BusinessDaysBadge
                        days={
                          pedido.estado === "finalizado"
                            ? getBusinessDaysBetween(
                                pedido.fecha_creacion,
                                pedido.fecha_aprobacion ?? pedido.fecha_creacion
                              )
                            : getBusinessDaysSince(pedido.fecha_creacion)
                        }
                      />
                    </td>
                  ) : (
                    <td className="w-[96px] px-3 py-4"></td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Table>
    </div>
  );
}

const PAGE_SIZE = 5;

export function PedidosPage({
  estado,
  prioridad,
  numeroPedido,
  pedidos,
  errorMessage,
  canEdit,
}: PedidosPageProps) {
  const pedidosActivos = pedidos.filter((pedido) => pedido.estado !== "finalizado");
  const pedidosFinalizados = pedidos.filter((pedido) => pedido.estado === "finalizado");
  const [visibleFinalizados, setVisibleFinalizados] = useState(PAGE_SIZE);
  const finalizadosVisible = pedidosFinalizados.slice(0, visibleFinalizados);
  const hayMas = visibleFinalizados < pedidosFinalizados.length;

  return (
    <div className={cn("PedidosPage", styles.PedidosPage, "space-y-6")}>
      <PageHeader
        eyebrow="Pedidos"
        title="Listado de pedidos"
        description="Filtrá presupuestos por estado y prioridad. La base ya queda lista para seguir con alta, edición, aprobación y PDF."
        actions={
          canEdit ? (
            <ButtonAdd classNameInner="w-full md:w-auto" href="/pedidos/nuevo">
              Nuevo pedido
            </ButtonAdd>
          ) : undefined
        }
      />

      {errorMessage ? (
        <section className="rounded-[28px] border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          Error al consultar la base de datos: {errorMessage}
        </section>
      ) : null}

      <Card as="section" className="space-y-5">
        <form className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,140px)_auto_auto]">
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

          <input
            type="number"
            name="numero"
            min="1"
            placeholder="Nº pedido"
            defaultValue={numeroPedido ?? ""}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-foreground-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          />

            <div className="flex gap-3">
              <Button type="submit" className="w-full md:w-auto" icon={<Icon name="search" className="h-4 w-4" />}>
                Filtrar
              </Button>
              <Button
                as="a"
                href="/pedidos"
                variant="secondary"
                className="w-full md:w-auto"
                icon={<Icon name="x" className="h-4 w-4" />}
              >
                Limpiar
              </Button>
            </div>
        </form>

        <div className="hidden md:block">
          <PedidoTable
            eyebrow="Activos"
            title="Pedidos activos"
            pedidos={pedidosActivos}
            emptyMessage="No hay pedidos pendientes ni aprobados para mostrar."
          />
        </div>

        <div className="md:hidden space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">Activos</p>
          {pedidosActivos.length === 0 ? (
            <p className="py-6 text-center text-sm text-[var(--color-foreground-muted)]">No hay pedidos pendientes ni aprobados para mostrar.</p>
          ) : (
            pedidosActivos.map((pedido) => (
              <PedidoMobileCard key={pedido.id} pedido={pedido} />
            ))
          )}
        </div>
      </Card>

      <div style={{ filter: "brightness(0.9) grayscale(0.6)" }}><Card as="section" className="space-y-5">
        <div className="hidden md:block space-y-4">
          <PedidoTable
            eyebrow="Finalizados"
            title="Pedidos finalizados"
            pedidos={finalizadosVisible}
            emptyMessage="No hay pedidos finalizados para mostrar."
            showBusinessDays={false}
          />
          {hayMas && (
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => setVisibleFinalizados((v) => v + PAGE_SIZE)}
              icon={<Icon name="chevronDown" className="h-4 w-4" />}
            >
              Cargar más finalizados
            </Button>
          )}
        </div>

        <div className="md:hidden space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">Finalizados</p>
          {finalizadosVisible.length === 0 ? (
            <p className="py-6 text-center text-sm text-[var(--color-foreground-muted)]">No hay pedidos finalizados para mostrar.</p>
          ) : (
            finalizadosVisible.map((pedido) => (
              <PedidoMobileCard key={pedido.id} pedido={pedido} showBusinessDays={false} />
            ))
          )}
          {hayMas && (
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => setVisibleFinalizados((v) => v + PAGE_SIZE)}
              icon={<Icon name="chevronDown" className="h-4 w-4" />}
            >
              Cargar más finalizados
            </Button>
          )}
        </div>
      </Card></div>
    </div>
  );
}
