"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import {
  TRABAJO_ESTADO_LABELS,
  TRABAJO_ESTADOS,
  TRABAJO_PRIORIDADES,
  type TrabajoEstado,
  type TrabajoListItem,
  type TrabajoPrioridad,
} from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { BusinessDaysDot } from "@/components/ui/BusinessDaysDot";
import {
  PriorityBadge,
  StatusBadge,
} from "@/components/ui/Badge";
import { ButtonAdd } from "@/components/ui/ButtonAdd";
import { useMobileActionsRegister } from "@/components/layout/MobileActions";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { useErrorNotification } from "@/components/ui/NotificationToast";
import { Select } from "@/components/ui/Select";
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import {
  formatDate,
  getBusinessDaysBetween,
  getBusinessDaysSince,
} from "@/lib/format";
import { TrabajoMobileCard } from "@/components/ui/TrabajoMobileCard";
import styles from "./TrabajosPage.module.scss";

function getEstadoReferenceDate(trabajo: TrabajoListItem) {
  if (trabajo.estado === "presupuesto_entregado") {
    return trabajo.fecha_presupuesto_entregado;
  }
  if (trabajo.estado === "aprobado" || trabajo.estado === "finalizado") {
    return trabajo.fecha_aprobacion;
  }
  return null;
}

const PRIORIDAD_ROW_ACCENT: Record<TrabajoPrioridad, string> = {
  alta: "shadow-[inset_3px_0_0_#e11d48]",
  normal: "shadow-[inset_3px_0_0_#0284c7]",
  baja: "shadow-[inset_3px_0_0_#475569]",
};

type TrabajosPageProps = {
  estado?: TrabajoEstado;
  prioridad?: TrabajoPrioridad;
  numeroTrabajo?: number;
  trabajos: TrabajoListItem[];
  diasHabilesUmbralVerde: number;
  diasHabilesUmbralNaranja: number;
  errorMessage: string | null;
  canEdit: boolean;
};

function TrabajoTable({
  title,
  eyebrow,
  trabajos,
  emptyMessage,
  diasHabilesUmbralVerde,
  diasHabilesUmbralNaranja,
  showBusinessDays = true,
  dimmed = false,
}: {
  title: string;
  eyebrow: string;
  trabajos: TrabajoListItem[];
  emptyMessage: string;
  diasHabilesUmbralVerde: number;
  diasHabilesUmbralNaranja: number;
  showBusinessDays?: boolean;
  dimmed?: boolean;
}) {
  const router = useRouter();

  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent)]">
          {eyebrow}
        </p>
        <h2 className="text-base font-semibold text-[var(--text-color-defult)]">
          {title}
        </h2>
        <span className="ml-auto text-xs text-[var(--text-color-gray)]">
          {trabajos.length} {trabajos.length === 1 ? "trabajo" : "trabajos"}
        </span>
      </div>

      <Table>
        <table className="w-full table-auto text-left text-sm">
          <thead>
            <tr className="border-b-2 border-[var(--color-accent)] text-[var(--text-color-gray)]">
              <th className="w-[52px] px-3 py-2.5 text-xs font-semibold uppercase tracking-wide">#</th>
              <th className="min-w-[130px] px-3 py-2.5 text-xs font-semibold uppercase tracking-wide">Cliente</th>
              <th className="min-w-[160px] px-3 py-2.5 text-xs font-semibold uppercase tracking-wide">Vehículo</th>
              <th className="w-[110px] px-3 py-2.5 text-xs font-semibold uppercase tracking-wide">Estado</th>
              <th className="w-[52px] px-3 py-2.5 text-xs font-semibold uppercase tracking-wide">
                <span className="group relative inline-flex items-center" aria-label="Cobro" tabIndex={0}>
                  <Icon name="sackDollar" size="xl" />
                  <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 rounded-md bg-[var(--text-color-defult)] px-2 py-1 text-xs font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100" role="tooltip">
                    Cobro
                  </span>
                </span>
              </th>
              <th className="w-[90px] px-3 py-2.5 text-xs font-semibold uppercase tracking-wide">Prioridad</th>
              <th className="w-[205px] px-3 py-2.5 text-xs font-semibold uppercase tracking-wide">Creación → Aprob.</th>
              {showBusinessDays ? (
                <th className="w-[80px] px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-right">Días háb.</th>
              ) : (
                <th className="w-[80px]" />
              )}
            </tr>
          </thead>
          <tbody className={cn(dimmed && "opacity-60")}>
            {trabajos.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-sm text-[var(--text-color-gray)]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              trabajos.map((trabajo) => (
                <tr
                  key={trabajo.id}
                  className={cn(
                    "cursor-pointer border-t border-[var(--color-border)] transition-colors",
                    "hover:bg-[var(--cream-warm)]/40 focus-within:bg-[var(--cream-warm)]/40",
                    PRIORIDAD_ROW_ACCENT[trabajo.prioridad]
                  )}
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
                  {/* Número */}
                  <td className="w-[52px] px-3 py-3.5">
                    <span className="font-bold text-[var(--color-accent)]">#</span>
                    <span className="font-bold text-[var(--text-color-defult)]">
                      {trabajo.numero_trabajo}
                    </span>
                  </td>

                  {/* Cliente */}
                  <td className="min-w-[130px] px-3 py-3.5">
                    {trabajo.cliente_id ? (
                      <Link
                        href={`/clientes/${trabajo.cliente_id}`}
                        className="relative z-[1] font-medium text-[var(--color-accent)] underline decoration-[var(--color-accent)]/40 underline-offset-2 transition hover:text-[var(--color-accent-strong)] hover:decoration-[var(--color-accent-strong)]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {trabajo.cliente_nombre ?? "Sin cliente"}
                      </Link>
                    ) : (
                      <span className="text-[var(--text-color-gray)]">Sin cliente</span>
                    )}
                  </td>

                  {/* Vehículo — marca · modelo · motor en una línea */}
                  <td className="min-w-[160px] px-3 py-3.5">
                    <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                      {trabajo.marca_nombre && (
                        <span className="text-[0.67rem] font-bold uppercase tracking-widest text-[var(--text-color-gray)]">
                          {trabajo.marca_nombre}
                        </span>
                      )}
                      <span className="font-medium text-[var(--text-color-defult)]">
                        {trabajo.modelo_nombre ?? "Sin modelo"}
                      </span>
                      {trabajo.motor_nombre && (
                        <span className="text-xs text-[var(--text-color-gray)]">
                          · {trabajo.motor_nombre}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Estado */}
                  <td className="w-[110px] px-3 py-3.5">
                    <StatusBadge estado={trabajo.estado} compact />
                  </td>

                  {/* Cobrado */}
                  <td className="w-[52px] px-3 py-3.5">
                    <span
                      className={cn(
                        "CobroIcon inline-flex items-center justify-center text-xl",
                        trabajo.cobrado ? "text-emerald-600" : "text-[var(--text-color-ligth)]"
                      )}
                      aria-label={trabajo.cobrado ? "Cobrado" : "No cobrado"}
                      title={trabajo.cobrado ? "Cobrado" : "No cobrado"}
                    >
                      <Icon name={trabajo.cobrado ? "sackDollar" : "sackXmark"} size="lg" />
                    </span>
                  </td>

                  {/* Prioridad */}
                  <td className="w-[90px] px-3 py-3.5">
                    <PriorityBadge prioridad={trabajo.prioridad} />
                  </td>

                  {/* Fechas */}
                  <td className="w-[205px] px-3 py-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-color-gray)]">
                      <span>{formatDate(trabajo.fecha_creacion)}</span>
                      <Icon name="arrowRight" className="h-3 w-3 shrink-0 text-[var(--color-accent)]/60" />
                      <span className={cn(!getEstadoReferenceDate(trabajo) && "italic opacity-50")}>
                        {formatDate(getEstadoReferenceDate(trabajo))}
                      </span>
                    </div>
                  </td>

                  {/* Días hábiles */}
                  {showBusinessDays ? (
                    <td className="w-[80px] px-3 py-3.5 text-right">
                      {(() => {
                        const days =
                          trabajo.estado === "finalizado"
                            ? getBusinessDaysBetween(
                                trabajo.fecha_creacion,
                                trabajo.fecha_aprobacion ?? trabajo.fecha_creacion
                              )
                            : getBusinessDaysSince(trabajo.fecha_creacion);
                        return (
                          <span className="inline-flex items-center justify-end gap-1.5">
                            <BusinessDaysDot
                              days={days}
                              verdeHasta={diasHabilesUmbralVerde}
                              naranjaHasta={diasHabilesUmbralNaranja}
                            />
                            <span className="text-sm font-bold tabular-nums text-[var(--text-color-defult)]">{days}</span>
                          </span>
                        );
                      })()}
                    </td>
                  ) : (
                    <td className="w-[80px]" />
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

export function TrabajosPage({
  estado,
  prioridad,
  numeroTrabajo,
  trabajos,
  diasHabilesUmbralVerde,
  diasHabilesUmbralNaranja,
  errorMessage,
  canEdit,
}: TrabajosPageProps) {
  const trabajosActivos = trabajos.filter((t) => t.estado !== "finalizado");
  const trabajosFinalizados = trabajos.filter((t) => t.estado === "finalizado");
  const [visibleFinalizados, setVisibleFinalizados] = useState(PAGE_SIZE);
  const finalizadosVisible = trabajosFinalizados.slice(0, visibleFinalizados);
  const hayMas = visibleFinalizados < trabajosFinalizados.length;

  const hayFiltros = estado || prioridad || numeroTrabajo;
  useErrorNotification(
    errorMessage ? `Error al consultar la base de datos: ${errorMessage}` : null,
    `${estado ?? ""}:${prioridad ?? ""}:${numeroTrabajo ?? ""}`
  );

  useMobileActionsRegister(
    canEdit ? (
      <Link
        href="/trabajos/nuevo"
        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[linear-gradient(135deg,var(--orange-vivid),var(--color-accent))] text-white text-sm font-semibold shadow-sm"
      >
        <Icon name="plus" className="h-3.5 w-3.5" />
        Nuevo trabajo
      </Link>
    ) : null
  );

  return (
    <div className={cn("TrabajosPage", styles.TrabajosPage, "space-y-6")}>
      <PageHeader
        eyebrow="Trabajos"
        title="Listado de trabajos"
        description="Filtrá por estado, prioridad o número. La base queda lista para presupuesto, aprobación y PDF."
        actions={
          canEdit ? (
            <div className="hidden md:block">
              <ButtonAdd href="/trabajos/nuevo">
                Nuevo trabajo
              </ButtonAdd>
            </div>
          ) : undefined
        }
      />

      {/* Filtros */}
      <Card as="section">
        <form className="flex flex-wrap gap-2">
          <Select name="estado" defaultValue={estado ?? ""} className="min-w-[160px] flex-1">
            <option value="">Todos los estados</option>
            {TRABAJO_ESTADOS.map((item) => (
              <option key={item} value={item}>
                {TRABAJO_ESTADO_LABELS[item]}
              </option>
            ))}
          </Select>

          <Select name="prioridad" defaultValue={prioridad ?? ""} className="min-w-[160px] flex-1">
            <option value="">Todas las prioridades</option>
            {TRABAJO_PRIORIDADES.map((item) => (
              <option key={item} value={item}>
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </option>
            ))}
          </Select>

          <input
            type="number"
            name="numero"
            min="1"
            placeholder="Nº trabajo"
            defaultValue={numeroTrabajo ?? ""}
            className="w-32 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--text-color-defult)] placeholder:text-[var(--text-color-ligth)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          />

          <div className="flex gap-2">
            <Button
              type="submit"
              icon={<Icon name="search" className="h-4 w-4" />}
            >
              Filtrar
            </Button>
            {hayFiltros && (
              <Button
                as="a"
                href="/trabajos"
                variant="ghost"
                icon={<Icon name="x" className="h-4 w-4" />}
              >
                Limpiar
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Activos — desktop */}
      <Card as="section" className="hidden md:block">
        <TrabajoTable
          eyebrow="Activos"
          title="Trabajos activos"
          trabajos={trabajosActivos}
          emptyMessage="No hay trabajos activos para mostrar."
          diasHabilesUmbralVerde={diasHabilesUmbralVerde}
          diasHabilesUmbralNaranja={diasHabilesUmbralNaranja}
        />
      </Card>

      {/* Activos — mobile */}
      <Card as="section" className="md:hidden space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent)]">Activos</p>
        {trabajosActivos.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--text-color-gray)]">
            No hay trabajos activos para mostrar.
          </p>
        ) : (
          trabajosActivos.map((trabajo) => (
            <TrabajoMobileCard key={trabajo.id} trabajo={trabajo} />
          ))
        )}
      </Card>

      {/* Finalizados — desktop */}
      <Card as="section" className="hidden md:block space-y-4">
        <TrabajoTable
          eyebrow="Finalizados"
          title="Trabajos finalizados"
          trabajos={finalizadosVisible}
          emptyMessage="No hay trabajos finalizados para mostrar."
          diasHabilesUmbralVerde={diasHabilesUmbralVerde}
          diasHabilesUmbralNaranja={diasHabilesUmbralNaranja}
          showBusinessDays={false}
          dimmed
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
      </Card>

      {/* Finalizados — mobile */}
      <Card as="section" className="md:hidden space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent)]">Finalizados</p>
        {finalizadosVisible.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--text-color-gray)]">
            No hay trabajos finalizados para mostrar.
          </p>
        ) : (
          finalizadosVisible.map((trabajo) => (
            <TrabajoMobileCard key={trabajo.id} trabajo={trabajo} showBusinessDays={false} />
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
      </Card>
    </div>
  );
}
