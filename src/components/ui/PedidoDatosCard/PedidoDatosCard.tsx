"use client";

import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { PaymentBadge, PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { TrabajosResumen } from "@/components/ui/TrabajosResumen/TrabajosResumen";
import { formatDate, getVehicleLabel } from "@/lib/format";
import type {
  PedidoEstado,
  PedidoPrioridad,
  RepuestoAgrupado,
  TrabajoAgrupado,
} from "@/lib/types";

type PedidoDatosCardProps = {
  estado: PedidoEstado;
  cobrado: boolean;
  prioridad: PedidoPrioridad;
  marcaNombre?: string | null;
  modeloNombre?: string | null;
  motorNombre?: string | null;
  numeroSerieMotor?: string | null;
  fechaCreacion: string;
  fechaAprobacion?: string | null;
  trabajos: TrabajoAgrupado[];
  repuestos?: RepuestoAgrupado[];
};

export function PedidoDatosCard({
  estado,
  cobrado,
  prioridad,
  marcaNombre,
  modeloNombre,
  motorNombre,
  numeroSerieMotor,
  fechaCreacion,
  fechaAprobacion,
  trabajos,
  repuestos = [],
}: PedidoDatosCardProps) {
  const vehicleLabel = getVehicleLabel([marcaNombre, modeloNombre, motorNombre]);

  return (
    <Card as="section" className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
        Datos del pedido
      </p>

      <dl className="space-y-3 text-sm">
        <div className="flex gap-2 flex-row sm:items-center justify-between">
          <dt className="flex items-center gap-2 text-[var(--color-foreground-muted)]">
            <Icon name="clipboard" className="h-4 w-4 shrink-0" />
            Estado
          </dt>
          <dd>
            <StatusBadge estado={estado} className="inline-flex w-[130px] justify-center" />
          </dd>
        </div>

        <div className="flex gap-2 flex-row sm:items-center justify-between">
          <dt className="flex items-center gap-2 text-[var(--color-foreground-muted)]">
            <Icon name="check" className="h-4 w-4 shrink-0" />
            Cobro
          </dt>
          <dd>
            <PaymentBadge cobrado={cobrado} className="inline-flex w-[130px] justify-center" />
          </dd>
        </div>

        <div className="flex gap-2 flex-row sm:items-center justify-between">
          <dt className="flex items-center gap-2 text-[var(--color-foreground-muted)]">
            <Icon name="gauge" className="h-4 w-4 shrink-0" />
            Prioridad
          </dt>
          <dd>
            <PriorityBadge prioridad={prioridad} className="inline-flex w-[130px] justify-center" />
          </dd>
        </div>

        <div className="flex gap-2 flex-row sm:items-center justify-between">
          <dt className="flex items-center gap-2 text-[var(--color-foreground-muted)]">
            <Icon name="car" className="h-4 w-4 shrink-0" />
            Vehículo
          </dt>
          <dd className="font-medium text-[var(--color-foreground)] sm:text-right">
            {vehicleLabel}
          </dd>
        </div>

        {numeroSerieMotor ? (
          <div className="flex gap-2 flex-row sm:items-center justify-between">
            <dt className="flex items-center gap-2 text-[var(--color-foreground-muted)]">
              <Icon name="hash" className="h-4 w-4 shrink-0" />
              Serie
            </dt>
            <dd className="font-medium text-[var(--color-foreground)]">
              {numeroSerieMotor}
            </dd>
          </div>
        ) : null}

        <div className="flex gap-2 flex-row sm:items-center justify-between">
          <dt className="flex items-center gap-2 text-[var(--color-foreground-muted)]">
            <Icon name="calendar" className="h-4 w-4 shrink-0" />
            Creación
          </dt>
          <dd className="font-medium text-[var(--color-foreground)]">
            {formatDate(fechaCreacion)}
          </dd>
        </div>

        {fechaAprobacion ? (
          <div className="flex gap-2 flex-row sm:items-center justify-between">
            <dt className="flex items-center gap-2 text-[var(--color-foreground-muted)]">
              <Icon name="calendar" className="h-4 w-4 shrink-0" />
              Aprobación
            </dt>
            <dd className="font-medium text-[var(--color-foreground)]">
              {formatDate(fechaAprobacion)}
            </dd>
          </div>
        ) : null}

        <div className="space-y-2">
          <div className="flex gap-2 flex-row sm:items-center justify-between">
            <dt className="flex items-center gap-2 text-[var(--color-foreground-muted)]">
              <Icon name="clipboard" className="h-4 w-4 shrink-0" />
              Items
            </dt>
          </div>
          <TrabajosResumen trabajos={trabajos} repuestos={repuestos} />
        </div>
      </dl>
    </Card>
  );
}
