"use client";

import { Card } from "@/components/ui/Card";
import { Icon, type IconName } from "@/components/ui/Icon";
import { PaymentBadge, PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { TrabajosResumen } from "@/components/ui/TrabajosResumen/TrabajosResumen";
import { formatDate, getVehicleLabel } from "@/lib/format";
import type { TrabajoDetalleItem } from "@/lib/queries/catalogo";
import type { RepuestoDetalleItem } from "@/lib/queries/repuestos";
import type {
  TrabajoEstado,
  TrabajoPrioridad,
  RepuestoAgrupado,
  TrabajoAgrupado,
} from "@/lib/types";

const EMPTY_REPUESTOS: RepuestoAgrupado[] = [];
const EMPTY_SNAPSHOT_TRABAJOS: TrabajoDetalleItem[] = [];
const EMPTY_SNAPSHOT_REPUESTOS: RepuestoDetalleItem[] = [];

type TrabajoDatosCardProps = {
  estado: TrabajoEstado;
  cobrado: boolean;
  prioridad: TrabajoPrioridad;
  marcaNombre?: string | null;
  modeloNombre?: string | null;
  motorNombre?: string | null;
  numeroSerieMotor?: string | null;
  fechaCreacion: string;
  fechaAprobacion?: string | null;
  trabajos: TrabajoAgrupado[];
  repuestos?: RepuestoAgrupado[];
  snapshotTrabajos?: TrabajoDetalleItem[];
  snapshotRepuestos?: RepuestoDetalleItem[];
  refreshSnapshotPricesAction?: (
    state: { error: string | null; success: boolean; updatedCount: number },
    formData: FormData
  ) => Promise<{ error: string | null; success: boolean; updatedCount: number }>;
};

function DataRow({
  icon,
  label,
  children,
}: {
  icon: IconName;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="flex shrink-0 items-center gap-2 text-xs text-[var(--text-color-gray)]">
        <Icon name={icon} className="size-3.5 shrink-0" />
        {label}
      </dt>
      <dd className="min-w-0 text-right">{children}</dd>
    </div>
  );
}

export function TrabajoDatosCard({
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
  repuestos = EMPTY_REPUESTOS,
  snapshotTrabajos = EMPTY_SNAPSHOT_TRABAJOS,
  snapshotRepuestos = EMPTY_SNAPSHOT_REPUESTOS,
  refreshSnapshotPricesAction,
}: TrabajoDatosCardProps) {
  const vehicleLabel = getVehicleLabel([marcaNombre, modeloNombre, motorNombre]);

  return (
    <Card as="section" className="space-y-4">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--color-accent)]">
        Resumen
      </p>

      {/* Badges de estado rápido */}
      <div className="flex flex-wrap gap-2">
        <StatusBadge estado={estado} compact />
        <PriorityBadge prioridad={prioridad} />
        <PaymentBadge cobrado={cobrado} />
      </div>

      {/* Datos del vehículo y fechas */}
      <dl className="space-y-2.5 border-t border-[var(--color-border)] pt-3.5 text-sm">
        {vehicleLabel ? (
          <DataRow icon="car" label="Vehículo">
            <span className="font-medium text-[var(--text-color-defult)] text-xs text-right leading-snug">
              {vehicleLabel}
            </span>
          </DataRow>
        ) : null}

        {numeroSerieMotor ? (
          <DataRow icon="hash" label="Serie">
            <span className="font-medium text-[var(--text-color-defult)] text-xs">
              {numeroSerieMotor}
            </span>
          </DataRow>
        ) : null}

        <DataRow icon="calendar" label="Creación">
          <span className="font-medium text-[var(--text-color-defult)] text-xs">
            {formatDate(fechaCreacion)}
          </span>
        </DataRow>

        {fechaAprobacion ? (
          <DataRow icon="calendar" label="Aprobación">
            <span className="font-medium text-[var(--text-color-defult)] text-xs">
              {formatDate(fechaAprobacion)}
            </span>
          </DataRow>
        ) : null}
      </dl>

      {/* Resumen de ítems */}
      <div className="space-y-2 border-t border-[var(--color-border)] pt-3.5">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--text-color-gray)]">
          Ítems del presupuesto
        </p>
        <TrabajosResumen
          trabajos={trabajos}
          repuestos={repuestos}
          snapshotTrabajos={snapshotTrabajos}
          snapshotRepuestos={snapshotRepuestos}
          refreshSnapshotPricesAction={refreshSnapshotPricesAction}
        />
      </div>
    </Card>
  );
}
