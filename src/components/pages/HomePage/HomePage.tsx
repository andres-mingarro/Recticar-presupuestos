"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { PriorityBadge } from "@/components/ui/Badge/Badge";
import { BusinessDaysDot } from "@/components/ui/BusinessDaysDot";
import { Card } from "@/components/ui/Card";
import { useMobileActionsRegister } from "@/components/layout/MobileActions";
import type { SessionPayload } from "@/lib/auth";
import type { AppPermiso } from "@/lib/queries/usuarios";
import type { IconName } from "@/components/ui/Icon";
import type {
  DashboardStats,
  TrabajoAprobadoRow,
  PresupuestoVencidoRow,
  RepuestoMasUsadoRow,
} from "@/lib/queries/trabajos";
import styles from "./HomePage.module.scss";

type MotorConNombre = { nombre: string; cantidad: number };

type HomePageProps = {
  session: SessionPayload | null;
  permisos: AppPermiso[];
  stats: DashboardStats;
  trabajosAprobados: TrabajoAprobadoRow[];
  diasHabilesUmbralVerde: number;
  diasHabilesUmbralNaranja: number;
  presupuestosVencidos: PresupuestoVencidoRow[];
  motoresMasUsados: MotorConNombre[];
  repuestosMasUsados: RepuestoMasUsadoRow[];
};

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: IconName;
  accent?: string;
}) {
  return (
    <div
      className={cn(
        "StatCard flex flex-col gap-2 rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[0_4px_16px_rgba(15,23,42,0.06)]",
        accent
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--text-color-gray)]">{label}</span>
        <Icon name={icon} className="text-[var(--text-color-gray)] opacity-50" />
      </div>
      <span className="text-3xl font-semibold tracking-tight">{value}</span>
    </div>
  );
}

export function HomePage({
  session,
  permisos,
  stats,
  trabajosAprobados,
  diasHabilesUmbralVerde,
  diasHabilesUmbralNaranja,
  presupuestosVencidos,
  motoresMasUsados,
  repuestosMasUsados,
}: HomePageProps) {
  const isSuperAdmin = session?.role === "super_admin";
  const canVerTrabajo = isSuperAdmin || permisos.includes("trabajos.ver");
  const canCrearTrabajo = isSuperAdmin || permisos.includes("trabajos.crear");
  const canVerClientes = isSuperAdmin || permisos.includes("clientes.acceso");

  const maxMotores = motoresMasUsados[0]?.cantidad ?? 1;
  const maxRepuestos = repuestosMasUsados[0]?.cantidad ?? 1;

  useMobileActionsRegister(
    (canCrearTrabajo || canVerClientes) ? (
      <>
        {canCrearTrabajo && (
          <Button as="a" href="/trabajos/nuevo" variant="primary" size="sm" icon={<Icon name="plus" className="size-3.5" />}>
            Trabajo
          </Button>
        )}
        {canVerClientes && (
          <Button as="a" href="/clientes/nuevo" variant="secondary" size="sm" icon={<Icon name="plus" className="size-3.5" />}>
            Cliente
          </Button>
        )}
      </>
    ) : null,
    [canCrearTrabajo, canVerClientes]
  );

  return (
    <div className={cn("HomePage", styles.HomePage, "space-y-7")}>

      {/* Stats + accesos rápidos */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {(canCrearTrabajo || canVerClientes) && (
          <div className="col-span-2 hidden flex-col justify-center gap-3 rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[0_4px_16px_rgba(15,23,42,0.06)] md:flex lg:col-span-1">
            {canCrearTrabajo && (
              <Button as="a" href="/trabajos/nuevo" variant="primary" icon={<Icon name="plus" />} className="w-full justify-center">
                Nuevo trabajo
              </Button>
            )}
            {canVerClientes && (
              <Button as="a" href="/clientes/nuevo" variant="secondary" icon={<Icon name="plus" />} className="w-full justify-center">
                Nuevo cliente
              </Button>
            )}
          </div>
        )}
        <StatCard label="Trabajos activos" value={stats.trabajosActivos} icon="clipboardList" />
        <StatCard label="Sin cobrar" value={stats.trabajosSinCobrar} icon="sackDollar" />
        <StatCard
          label="Alta prioridad"
          value={stats.trabajosAltaPrioridad}
          icon="gauge"
          accent={stats.trabajosAltaPrioridad > 0 ? "border-rose-200 bg-rose-50" : undefined}
        />
        <StatCard label="Clientes" value={stats.clientesTotales} icon="user" />
      </section>

      <div className="grid gap-7 lg:grid-cols-2">
        {/* Trabajos a atender */}
        {canVerTrabajo && (
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-color-gray)]">
                Trabajos a atender
              </h2>
              <Link href="/trabajos" className="text-xs text-[var(--color-accent)] hover:underline">
                Ver todos
              </Link>
            </div>
            {trabajosAprobados.length === 0 ? (
              <p className="px-5 pb-5 text-sm text-[var(--text-color-gray)]">Sin trabajos aprobados.</p>
            ) : (
              <ul className="divide-y divide-[var(--color-border)]">
                {trabajosAprobados.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/trabajos/${t.id}`}
                      className="flex items-center gap-3 px-5 py-3 transition hover:bg-[var(--color-surface)]"
                    >
                      <PriorityBadge prioridad={t.prioridad} className="shrink-0 text-[10px] px-2 py-0.5" />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">
                        #{t.numero_trabajo}
                        {t.cliente_nombre && (
                          <span className="ml-2 font-normal text-[var(--text-color-gray)]">
                            {t.cliente_nombre}
                          </span>
                        )}
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-[var(--text-color-gray)]">
                        <BusinessDaysDot
                          days={t.dias_desde_aprobacion}
                          verdeHasta={diasHabilesUmbralVerde}
                          naranjaHasta={diasHabilesUmbralNaranja}
                        />
                        {t.dias_desde_aprobacion}d
                      </span>
                      <Icon name="chevronRight" size="xs" className="shrink-0 text-[var(--text-color-gray)]" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}

        {/* Presupuestos sin respuesta */}
        {canVerTrabajo && (
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-color-gray)]">
                Presupuestos sin respuesta
              </h2>
              <Link href="/trabajos" className="text-xs text-[var(--color-accent)] hover:underline">
                Ver todos
              </Link>
            </div>
            {presupuestosVencidos.length === 0 ? (
              <p className="px-5 pb-5 text-sm text-[var(--text-color-gray)]">Sin presupuestos vencidos.</p>
            ) : (
              <ul className="divide-y divide-[var(--color-border)]">
                {presupuestosVencidos.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/trabajos/${p.id}`}
                      className="flex items-center gap-3 px-5 py-3 transition hover:bg-[var(--color-surface)]"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">
                        #{p.numero_trabajo}
                        {p.cliente_nombre && (
                          <span className="ml-2 font-normal text-[var(--text-color-gray)]">
                            {p.cliente_nombre}
                          </span>
                        )}
                      </span>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                          p.dias_esperando >= 7
                            ? "bg-rose-100 text-rose-700"
                            : "bg-amber-100 text-amber-700"
                        )}
                      >
                        {p.dias_esperando}d
                      </span>
                      <Icon name="chevronRight" size="xs" className="shrink-0 text-[var(--text-color-gray)]" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}

        {/* Motores más trabajados */}
        {motoresMasUsados.length > 0 && (
          <Card className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-color-gray)]">
              Motores más trabajados
            </h2>
            <ul className="space-y-3">
              {motoresMasUsados.map((m) => (
                <li key={m.nombre} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{m.nombre}</span>
                    <span className="text-[var(--text-color-gray)]">{m.cantidad}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
                    <div
                      className="h-full rounded-full bg-[var(--color-accent)]"
                      style={{ width: `${Math.round((m.cantidad / maxMotores) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Repuestos más usados */}
        {repuestosMasUsados.length > 0 && (
          <Card className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-color-gray)]">
              Repuestos más usados
            </h2>
            <ul className="space-y-3">
              {repuestosMasUsados.map((r) => (
                <li key={r.repuesto_nombre_snapshot} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{r.repuesto_nombre_snapshot}</span>
                    <span className="text-[var(--text-color-gray)]">{r.cantidad}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,var(--orange-vivid),var(--peach-soft))]"
                      style={{ width: `${Math.round((r.cantidad / maxRepuestos) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

    </div>
  );
}
