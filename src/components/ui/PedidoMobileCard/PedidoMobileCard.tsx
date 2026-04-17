"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PedidoListItem } from "@/lib/types";
import {
  PaymentBadge,
  PriorityBadge,
  StatusBadge,
} from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { formatDate, getBusinessDaysBetween, getBusinessDaysSince } from "@/lib/format";

type Props = {
  pedido: PedidoListItem;
  showBusinessDays?: boolean;
};

export function PedidoMobileCard({ pedido, showBusinessDays = true }: Props) {
  const router = useRouter();

  const businessDays =
    pedido.estado === "finalizado"
      ? getBusinessDaysBetween(
          pedido.fecha_creacion,
          pedido.fecha_aprobacion ?? pedido.fecha_creacion
        )
      : getBusinessDaysSince(pedido.fecha_creacion);

  return (
    <div
      className="PedidoMobileCard flex flex-col gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 cursor-pointer transition hover:bg-[var(--color-surface-alt)]"
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/pedidos/${pedido.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(`/pedidos/${pedido.id}`);
        }
      }}
    >
      {/* Cliente + número */}
      <div className="flex items-center justify-between gap-2">
        {pedido.cliente_id ? (
          <Link
            href={`/clientes/${pedido.cliente_id}`}
            className="flex items-center gap-1.5 text-base font-semibold text-[var(--color-accent)] truncate"
            onClick={(e) => e.stopPropagation()}
          >
            <Icon name="user" className="h-4 w-4 shrink-0" />
            {pedido.cliente_nombre ?? "Sin cliente asignado"}
          </Link>
        ) : (
          <span className="flex items-center gap-1.5 text-base font-semibold text-[var(--color-foreground-muted)] truncate">
            <Icon name="user" className="h-4 w-4 shrink-0" />
            Sin cliente asignado
          </span>
        )}
        <span className="text-xs font-bold tracking-wide text-[var(--color-foreground-muted)] shrink-0">
          #{pedido.numero_pedido}
        </span>
      </div>

      {/* Detalle vehículo */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[0.63rem] font-bold uppercase tracking-[0.15em] text-[var(--color-foreground-subtle)]">
          {pedido.marca_nombre ?? "Marca sin definir"}
        </span>
        <span className="text-sm font-medium text-[var(--color-foreground)]">
          {pedido.modelo_nombre ?? "Modelo sin definir"}
        </span>
        <span className="text-xs text-[var(--color-foreground-muted)]">
          {pedido.motor_nombre ?? "Motor sin definir"}
        </span>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1 [&_.Badge]:shadow-none">
        <PriorityBadge prioridad={pedido.prioridad} />
        <PaymentBadge cobrado={pedido.cobrado} />
        <StatusBadge estado={pedido.estado} />
      </div>

      {/* Footer: fechas + días hábiles */}
      <div className="flex items-center justify-between gap-1 border-t border-[var(--color-border)] pt-1.5">
        <div className="flex items-center gap-1 text-[0.72rem] text-[var(--color-foreground-muted)]">
          <span>{formatDate(pedido.fecha_creacion)}</span>
          <span>→</span>
          <span>{pedido.estado === "pendiente" ? "--/--/----" : formatDate(pedido.fecha_aprobacion)}</span>
        </div>
        {showBusinessDays && (
          <span className="inline-flex items-center rounded-full border border-[var(--color-border)] px-2.5 py-1 text-xs font-medium text-[var(--color-foreground-muted)]">
            {businessDays} días háb.
          </span>
        )}
      </div>
    </div>
  );
}
