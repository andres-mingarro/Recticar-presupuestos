"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import type { TrabajoListItem, TrabajoPrioridad } from "@/lib/types";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { formatDate, getBusinessDaysBetween, getBusinessDaysSince } from "@/lib/format";

function getEstadoReferenceDate(trabajo: TrabajoListItem) {
  if (trabajo.estado === "presupuesto_entregado") return trabajo.fecha_presupuesto_entregado;
  if (trabajo.estado === "aprobado" || trabajo.estado === "finalizado") return trabajo.fecha_aprobacion;
  return null;
}

const PRIORIDAD_BORDER: Record<TrabajoPrioridad, string> = {
  alta: "border-l-[3px] border-l-rose-500",
  normal: "border-l-[3px] border-l-sky-500",
  baja: "border-l-[3px] border-l-slate-400",
};

type Props = {
  trabajo: TrabajoListItem;
  showBusinessDays?: boolean;
};

export function TrabajoMobileCard({ trabajo, showBusinessDays = true }: Props) {
  const { push } = useRouter();

  const businessDays =
    trabajo.estado === "finalizado"
      ? getBusinessDaysBetween(trabajo.fecha_creacion, trabajo.fecha_aprobacion ?? trabajo.fecha_creacion)
      : getBusinessDaysSince(trabajo.fecha_creacion);

  return (
    <div
      className={cn(
        "TrabajoMobileCard",
        "flex flex-col gap-2.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5 cursor-pointer transition-colors hover:bg-[var(--cream-warm)]/40",
        PRIORIDAD_BORDER[trabajo.prioridad]
      )}
      role="link"
      tabIndex={0}
      onClick={() => push(`/trabajos/${trabajo.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          push(`/trabajos/${trabajo.id}`);
        }
      }}
    >
      {/* Fila top: número + estado + días hábiles */}
      <div className="flex items-center gap-2">
        <span className="shrink-0 text-sm font-bold">
          <span className="text-[var(--color-accent)]">#</span>
          <span className="text-[var(--text-color-defult)]">{trabajo.numero_trabajo}</span>
        </span>
        <StatusBadge estado={trabajo.estado} compact />
        {trabajo.cobrado && (
          <span className="inline-flex items-center gap-1 text-[0.67rem] font-semibold text-emerald-600">
            <Icon name="sackDollar" size="sm" />
            Cobrado
          </span>
        )}
        {showBusinessDays && (
          <span className="ml-auto shrink-0 rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[0.67rem] font-medium text-[var(--text-color-gray)]">
            {businessDays} d.h.
          </span>
        )}
      </div>

      {/* Cliente */}
      <div className="flex items-center gap-1.5">
        <Icon name="user" className="size-3.5 shrink-0 text-[var(--text-color-gray)]" />
        {trabajo.cliente_id ? (
          <Link
            href={`/clientes/${trabajo.cliente_id}`}
            className="truncate text-sm font-semibold text-[var(--color-accent)] underline decoration-[var(--color-accent)]/40 underline-offset-2 hover:text-[var(--color-accent-strong)]"
            onClick={(e) => e.stopPropagation()}
          >
            {trabajo.cliente_nombre ?? "Sin cliente"}
          </Link>
        ) : (
          <span className="truncate text-sm font-semibold text-[var(--text-color-gray)]">Sin cliente</span>
        )}
      </div>

      {/* Vehículo */}
      <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
        {trabajo.marca_nombre && (
          <span className="text-[0.63rem] font-bold uppercase tracking-widest text-[var(--text-color-gray)]">
            {trabajo.marca_nombre}
          </span>
        )}
        <span className="text-sm font-medium text-[var(--text-color-defult)]">
          {trabajo.modelo_nombre ?? "Sin modelo"}
        </span>
        {trabajo.motor_nombre && (
          <span className="text-xs text-[var(--text-color-gray)]">
            · {trabajo.motor_nombre}
          </span>
        )}
      </div>

      {/* Footer: prioridad + fechas */}
      <div className="flex items-center justify-between gap-2 border-t border-[var(--color-border)] pt-2">
        <PriorityBadge prioridad={trabajo.prioridad} />
        <div className="flex items-center gap-1 text-[0.7rem] text-[var(--text-color-gray)]">
          <span>{formatDate(trabajo.fecha_creacion)}</span>
          <Icon name="arrowRight" className="size-3 text-[var(--color-accent)]/60" />
          <span className={cn(!getEstadoReferenceDate(trabajo) && "italic opacity-50")}>
            {formatDate(getEstadoReferenceDate(trabajo))}
          </span>
        </div>
      </div>
    </div>
  );
}
