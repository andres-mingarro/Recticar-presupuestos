"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { TrabajoListItem } from "@/lib/types";
import {
  PaymentBadge,
  PriorityBadge,
  StatusBadge,
} from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { formatDate, getBusinessDaysBetween, getBusinessDaysSince } from "@/lib/format";

type Props = {
  trabajo: TrabajoListItem;
  showBusinessDays?: boolean;
};

export function TrabajoMobileCard({ trabajo, showBusinessDays = true }: Props) {
  const router = useRouter();

  const businessDays =
    trabajo.estado === "finalizado"
      ? getBusinessDaysBetween(
          trabajo.fecha_creacion,
          trabajo.fecha_aprobacion ?? trabajo.fecha_creacion
        )
      : getBusinessDaysSince(trabajo.fecha_creacion);

  return (
    <div
      className="TrabajoMobileCard flex flex-col gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 cursor-pointer transition hover:bg-[var(--color-surface-alt)]"
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/trabajos/${trabajo.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(`/trabajos/${trabajo.id}`);
        }
      }}
    >
      {/* Cliente + número */}
      <div className="flex items-center justify-between gap-2">
        {trabajo.cliente_id ? (
          <Link
            href={`/clientes/${trabajo.cliente_id}`}
            className="flex items-center gap-1.5 text-base font-semibold text-[var(--color-accent)] truncate"
            onClick={(e) => e.stopPropagation()}
          >
            <Icon name="user" className="h-4 w-4 shrink-0" />
            {trabajo.cliente_nombre ?? "Sin cliente asignado"}
          </Link>
        ) : (
          <span className="flex items-center gap-1.5 text-base font-semibold text-[var(--text-color-gray)] truncate">
            <Icon name="user" className="h-4 w-4 shrink-0" />
            Sin cliente asignado
          </span>
        )}
        <span className="text-xs font-bold tracking-wide text-[var(--text-color-gray)] shrink-0">
          #{trabajo.numero_trabajo}
        </span>
      </div>

      {/* Detalle vehículo */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[0.63rem] font-bold uppercase tracking-[0.15em] text-[var(--text-color-ligth)]">
          {trabajo.marca_nombre ?? "Marca sin definir"}
        </span>
        <span className="text-sm font-medium text-[var(--text-color-defult)]">
          {trabajo.modelo_nombre ?? "Modelo sin definir"}
        </span>
        <span className="text-xs text-[var(--text-color-gray)]">
          {trabajo.motor_nombre ?? "Motor sin definir"}
        </span>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1 [&_.Badge]:shadow-none">
        <PriorityBadge prioridad={trabajo.prioridad} />
        <PaymentBadge cobrado={trabajo.cobrado} />
        <StatusBadge estado={trabajo.estado} />
      </div>

      {/* Footer: fechas + días hábiles */}
      <div className="flex items-center justify-between gap-1 border-t border-[var(--color-border)] pt-1.5">
        <div className="flex items-center gap-1 text-[0.72rem] text-[var(--text-color-gray)]">
          <span>{formatDate(trabajo.fecha_creacion)}</span>
          <span>→</span>
          <span>{trabajo.estado === "pendiente" ? "--/--/----" : formatDate(trabajo.fecha_aprobacion)}</span>
        </div>
        {showBusinessDays && (
          <span className="inline-flex items-center rounded-full border border-[var(--color-border)] px-2.5 py-1 text-xs font-medium text-[var(--text-color-gray)]">
            {businessDays} días háb.
          </span>
        )}
      </div>
    </div>
  );
}
