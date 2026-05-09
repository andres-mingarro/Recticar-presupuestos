"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import type { CobradoMensualRow, CobradoAnualRow } from "@/lib/queries/estadisticas";
import type { AjusteListaPreciosRow } from "@/lib/queries/ajustes";
import styles from "./EstadisticasPage.module.scss";

const MESES_ABREV = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const MONTO_FORMATTER = new Intl.NumberFormat("es-AR");
const CURRENCY_FORMATTER = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

type Props = {
  anioSeleccionado: number;
  aniosDisponibles: number[];
  datosMensuales: CobradoMensualRow[];
  resumenAnual: CobradoAnualRow[];
  historialAjustes: AjusteListaPreciosRow[];
};

function formatMonto(value: number) {
  if (value === 0) return null;
  return `$${MONTO_FORMATTER.format(value)}`;
}

function BarChart({ datosMensuales }: { datosMensuales: CobradoMensualRow[] }) {
  const meses = MESES_ABREV.map((label, i) => {
    const mes = i + 1;
    const dato = datosMensuales.find((d) => d.mes === mes);
    return { label, mes, cantidad: dato?.cantidad ?? 0, total: dato?.total ?? 0 };
  });

  const maxCantidad = Math.max(...meses.map((m) => m.cantidad), 1);
  const totalAnio = meses.reduce((acc, m) => acc + m.cantidad, 0);

  if (totalAnio === 0) {
    return (
      <div className={styles.emptyChart}>
        <span>Sin trabajos cobrados este año</span>
      </div>
    );
  }

  return (
    <div className={styles.chartContainer}>
      {/* Fila de cantidades — fuera del scroll */}
      <div className={styles.cantidadRow}>
        {meses.map((m) => (
          <div key={m.mes} className={styles.cantidadCell}>
            <span className={cn(styles.barValue, m.cantidad === 0 && styles.barValueHidden)}>
              {m.cantidad}
            </span>
          </div>
        ))}
      </div>
      {/* Barras con scroll horizontal si hace falta */}
      <div className={styles.chartWrapper}>
        <div className={styles.barChart}>
          {meses.map((m) => {
            const heightPct = m.cantidad > 0 ? Math.max((m.cantidad / maxCantidad) * 100, 6) : 0;
            const monto = formatMonto(m.total);
            return (
              <div key={m.mes} className={styles.barCol}>
                <div className={styles.barTrack}>
                  <div className={styles.bar} style={{ height: `${heightPct}%` }}>
                    {monto && <span className={styles.barMonto}>{monto}</span>}
                  </div>
                </div>
                <span className={styles.barLabel}>{m.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function formatPct(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function EstadisticasPage({
  anioSeleccionado,
  aniosDisponibles,
  datosMensuales,
  resumenAnual,
  historialAjustes,
}: Props) {
  const searchParams = useSearchParams();
  const totalAnio = datosMensuales.reduce((acc, m) => acc + m.cantidad, 0);
  const totalFacturadoAnio = datosMensuales.reduce((acc, m) => acc + m.total, 0);
  const aniosParaMostrar = aniosDisponibles.length > 0 ? aniosDisponibles : [anioSeleccionado];

  function buildAnoUrl(anio: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("año", String(anio));
    return `/estadisticas?${params.toString()}`;
  }

  const tieneAjustes = historialAjustes.length > 0;

  return (
    <div className={cn("EstadisticasPage", styles.EstadisticasPage, "space-y-7")}>
      <PageHeader
        eyebrow="Registros"
        title="Estadísticas"
        description="Trabajos cobrados por período"
      />

      {/* ── Cobrados ── */}
      <div className={styles.grid}>
        <Card className={styles.chartCard}>
          <div className="mb-4 border-b border-[var(--color-border)] pb-3 flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="mb-0.5 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent)]">Mensual</p>
              <h2 className="text-base font-semibold text-[var(--text-color-defult)]">Trabajos cobrados</h2>
            </div>
            <div className={styles.yearSelector}>
              {aniosParaMostrar.map((anio) => (
                <Link
                  key={anio}
                  href={buildAnoUrl(anio)}
                  className={cn(styles.yearBtn, anio === anioSeleccionado && styles.yearBtnActive)}
                >
                  {anio}
                </Link>
              ))}
            </div>
          </div>

          <div className={styles.chartTotalRow}>
            <span className={styles.chartTotal}>{totalAnio}</span>
            <span className={styles.chartTotalLabel}>cobrados en {anioSeleccionado}</span>
            {totalFacturadoAnio > 0 && (
              <span className={styles.chartTotalMonto}>
                {CURRENCY_FORMATTER.format(totalFacturadoAnio)}
              </span>
            )}
          </div>

          <BarChart datosMensuales={datosMensuales} />
        </Card>

        <Card className={styles.summaryCard}>
          <div className="mb-4 border-b border-[var(--color-border)] pb-3">
            <p className="mb-0.5 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent)]">Histórico</p>
            <h2 className="text-base font-semibold text-[var(--text-color-defult)]">Resumen anual</h2>
          </div>
          {resumenAnual.length === 0 ? (
            <p className={styles.emptyText}>Sin datos</p>
          ) : (
            <div className={styles.summaryTable}>
              <div className={styles.summaryHeaderRow}>
                <span>Año</span>
                <span>Cobrados</span>
                <span>Total</span>
              </div>
              {resumenAnual.map((row) => (
                <Link
                  key={row.anio}
                  href={buildAnoUrl(row.anio)}
                  className={cn(styles.summaryRow, row.anio === anioSeleccionado && styles.summaryRowActive)}
                >
                  <span className={styles.summaryAnio}>{row.anio}</span>
                  <span className={styles.summaryCantidad}>{row.cantidad}</span>
                  <span className={styles.summaryTotal}>
                    {row.total > 0 ? CURRENCY_FORMATTER.format(row.total) : "—"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── Historial de precios ── */}
      <Card className={styles.preciosCard}>
        <div className="mb-4 border-b border-[var(--color-border)] pb-3">
          <p className="mb-0.5 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent)]">Precios</p>
          <h2 className="text-base font-semibold text-[var(--text-color-defult)]">Variación de lista de precios</h2>
          <p className="mt-1 text-sm leading-5 text-[var(--text-color-gray)]">Ajustes porcentuales registrados por categoría</p>
        </div>

        {/* Tabla por categoría */}
        {!tieneAjustes ? (
          <p className={styles.emptyText}>
            Sin registros aún. Los ajustes se guardan automáticamente cuando aplicás un porcentaje en la pantalla de Precios.
          </p>
        ) : (
          <div className={styles.historialTable}>
            {/* Header grupos Lista */}
            <div className={styles.historialHeaderRow}>
              <span />
              {([1, 2, 3] as const).map((n) => (
                <div key={n} className={cn(styles.listaHeaderGroup, styles[`listaHeaderGroup${n}`])}>
                  <span className={styles.listaHeaderLabel}>Lista {n}</span>
                  <div className={styles.listaSubHeaders}>
                    <span>Mes</span>
                    <span>Este año</span>
                    <span>12 meses</span>
                  </div>
                </div>
              ))}
            </div>
            {historialAjustes.map((row, rowIdx) => (
              <div key={row.categoria_id} className={cn(styles.historialRow, rowIdx % 2 === 0 && styles.historialRowAlt)}>
                <span className={styles.historialCategoria}>{row.categoria_nombre}</span>
                {([
                  [row.mes_lista_1, row.anio_lista_1, row.doce_meses_lista_1],
                  [row.mes_lista_2, row.anio_lista_2, row.doce_meses_lista_2],
                  [row.mes_lista_3, row.anio_lista_3, row.doce_meses_lista_3],
                ] as [number, number, number][]).map((periodos, li) => (
                  <div key={li} className={styles.listaCellGroup}>
                    {periodos.map((val, pi) => (
                      <span
                        key={pi}
                        className={cn(styles.historialPct, val > 0 && styles.pctPos, val < 0 && styles.pctNeg)}
                      >
                        {val !== 0 ? formatPct(val) : <span className={styles.pctZero}>—</span>}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
