"use client";

import { useRouter } from "next/navigation";
import type { ClienteListItem } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

type Props = {
  cliente: ClienteListItem;
  pendientes: number;
  onPendientesClick?: () => void;
};

export function ClienteMobileCard({ cliente, pendientes, onPendientesClick }: Props) {
  const router = useRouter();

  return (
    <div
      className="ClienteMobileCard flex flex-col gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 cursor-pointer transition hover:bg-[var(--color-surface-alt)]"
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/clientes/${cliente.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(`/clientes/${cliente.id}`);
        }
      }}
    >
      {/* Número + pendientes */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold tracking-wide text-[var(--text-color-gray)]">
          <Icon name="hash" className="inline h-3 w-3 mr-0.5" />
          {cliente.numero_cliente}
        </span>
        {pendientes > 0 && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            icon={<Icon name="clipboard" className="h-3 w-3" />}
            onClick={(e) => {
              e.stopPropagation();
              onPendientesClick?.();
            }}
          >
            {pendientes} pendientes
          </Button>
        )}
      </div>

      {/* Nombre */}
      <span className="flex items-center gap-1.5 text-base font-semibold text-[var(--color-accent)] truncate">
        <Icon name="user" className="h-4 w-4 shrink-0" />
        {cliente.apellido}, {cliente.nombre}
      </span>

      {/* Teléfono */}
      {cliente.telefono ? (
        <a
          href={`tel:${cliente.telefono.replace(/\D/g, "")}`}
          className="flex items-center gap-1.5 text-sm text-[var(--text-color-gray)] w-fit"
          onClick={(e) => e.stopPropagation()}
        >
          <Icon name="phone" className="h-3.5 w-3.5 shrink-0" />
          {cliente.telefono}
        </a>
      ) : (
        <span className="flex items-center gap-1.5 text-sm text-[var(--text-color-ligth)]">
          <Icon name="phone" className="h-3.5 w-3.5 shrink-0" />
          Sin teléfono
        </span>
      )}
    </div>
  );
}
