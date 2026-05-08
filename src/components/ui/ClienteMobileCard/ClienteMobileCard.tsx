"use client";

import { useRouter } from "next/navigation";
import type { ClienteListItem } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

type Props = {
  cliente: ClienteListItem;
  pendientes: number;
  onPendientesClick?: () => void;
};

export function ClienteMobileCard({ cliente, pendientes, onPendientesClick }: Props) {
  const { push } = useRouter();
  return (
    <div
      className="ClienteMobileCard flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 cursor-pointer transition-colors hover:border-[rgba(234,88,12,0.3)] hover:bg-[var(--cream-warm)]"
      role="link"
      tabIndex={0}
      onClick={() => push(`/clientes/${cliente.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          push(`/clientes/${cliente.id}`);
        }
      }}
    >
      {/* Content */}
      <div className="min-w-0 flex-1 grid gap-0.5">
        {/* Número */}
        <span className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[var(--text-color-ligth)]">
          #{cliente.numero_cliente}
        </span>

        {/* Nombre */}
        <span className="text-sm font-semibold text-[var(--text-color-defult)] truncate leading-tight">
          {cliente.apellido}, {cliente.nombre}
        </span>

        {/* Teléfono */}
        {cliente.telefono ? (
          <a
            href={`tel:${cliente.telefono.replace(/\D/g, "")}`}
            className="flex items-center gap-1 text-xs text-[var(--text-color-gray)] w-fit"
            onClick={(e) => e.stopPropagation()}
          >
            <Icon name="phone" className="size-3 shrink-0" />
            {cliente.telefono}
          </a>
        ) : (
          <span className="text-xs text-[var(--text-color-ligth)] italic">Sin teléfono</span>
        )}
      </div>

      {/* Pendientes */}
      {pendientes > 0 ? (
        <button
          type="button"
          className={cn(
            "shrink-0 flex flex-col items-center justify-center gap-0.5",
            "min-w-[3rem] rounded-xl border border-[rgba(234,88,12,0.28)]",
            "bg-[linear-gradient(135deg,rgba(255,247,237,0.98),rgba(255,255,255,0.9))]",
            "px-2.5 py-2 text-center transition-all",
            "hover:border-[rgba(234,88,12,0.45)] hover:bg-[#ffedd5] active:scale-95"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onPendientesClick?.();
          }}
          aria-label={`${pendientes} trabajos pendientes`}
        >
          <span className="text-base font-bold leading-none text-[var(--color-accent-strong)]">{pendientes}</span>
          <span className="text-[0.6rem] font-semibold uppercase tracking-wide text-[var(--color-accent)] leading-none">
            {pendientes === 1 ? "pend." : "pend."}
          </span>
        </button>
      ) : (
        <div className="shrink-0 flex items-center justify-center min-w-[2rem]">
          <Icon name="chevronRight" className="size-4 text-[var(--text-color-ligth)]" />
        </div>
      )}
    </div>
  );
}
