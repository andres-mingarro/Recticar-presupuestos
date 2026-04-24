"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatDate } from "@/lib/format";
import type { CobradoMensualRow, CobradoAnualRow } from "@/lib/queries/estadisticas";
import type { AjusteListaPreciosRow, AcumuladoAjustes } from "@/lib/queries/ajustes";
import styles from "./EstadisticasPage.module.scss";

const MESES_ABREV = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

type Props = {
  anioSeleccionado: number;
  aniosDisponibles: number[];
  datosMensuales: CobradoMensualRow[];
  resumenAnual: CobradoAnualRow[];
  historialAjustes: AjusteListaPreciosRow[];
  acumuladoAjustes: AcumuladoAjustes;
};

function BarChart({ datosMensuales }: { datosMensuales: CobradoMensualRow[] }) {
  const meses = MESES_ABREV.map((label, i) => {
    const mes = i + 1;
    const dato = datosMensuales.find((d) => d.mes === mes);
    return { label, mes, cantidad: dato?.cantidad ?? 0 };
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
    <div className={styles.chartWrapper}>
      <div className={styles.barChart}>
        {meses.map((m) => {
          const heightPct = m.cantidad > 0 ? Math.max((m.cantidad / maxCantidad) * 100, 6) : 0;
          return (
            <div key={m.mes} className={styles.barCol}>
              <span className={cn(styles.barValue, m.cantidad === 0 && styles.barValueHidden)}>
                {m.cantidad}
              </span>
              <div className={styles.barTrack}>
                <div
                  className={styles.bar}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
              <span className={styles.barLabel}>{m.label}</span>
            </div>
          );
        })}
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
  acumuladoAjustes,
}: Props) {
  const searchParams = useSearchParams();
  const totalAnio = datosMensuales.reduce((acc, m) => acc + m.cantidad, 0);
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
          <div className={styles.chartHeader}>
            <div className={styles.chartTitleGroup}>
              <h2 className={styles.cardTitle}>Trabajos cobrados</h2>
              <span className={styles.chartSubtitle}>Registro mensual</span>
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
          </div>

          <BarChart datosMensuales={datosMensuales} />
        </Card>

        <Card className={styles.summaryCard}>
          <h2 className={styles.cardTitle}>Resumen anual</h2>
          {resumenAnual.length === 0 ? (
            <p className={styles.emptyText}>Sin datos</p>
          ) : (
            <div className={styles.summaryTable}>
              <div className={styles.summaryHeaderRow}>
                <span>Año</span>
                <span>Cobrados</span>
              </div>
              {resumenAnual.map((row) => (
                <Link
                  key={row.anio}
                  href={buildAnoUrl(row.anio)}
                  className={cn(styles.summaryRow, row.anio === anioSeleccionado && styles.summaryRowActive)}
                >
                  <span className={styles.summaryAnio}>{row.anio}</span>
                  <span className={styles.summaryCantidad}>{row.cantidad}</span>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── Historial de precios ── */}
      <Card className={styles.preciosCard}>
        <div className={styles.preciosHeader}>
          <div>
            <h2 className={styles.cardTitle}>Variación de lista de precios</h2>
            <span className={styles.chartSubtitle}>Ajustes porcentuales registrados por categoría</span>
          </div>
        </div>

        {/* Acumulado por lista */}
        <div className={styles.acumuladoRow}>
          {([1, 2, 3] as const).map((lista) => {
            const val = lista === 1
              ? acumuladoAjustes.total_lista_1
              : lista === 2
              ? acumuladoAjustes.total_lista_2
              : acumuladoAjustes.total_lista_3;
            const isPos = val > 0;
            const isNeg = val < 0;
            return (
              <div key={lista} className={styles.acumuladoCard}>
                <span className={styles.acumuladoLabel}>Lista {lista}</span>
                <span className={cn(
                  styles.acumuladoValue,
                  isPos && styles.acumuladoPos,
                  isNeg && styles.acumuladoNeg,
                )}>
                  {tieneAjustes ? formatPct(val) : "—"}
                </span>
                <span className={styles.acumuladoSub}>acumulado</span>
              </div>
            );
          })}
        </div>

        {/* Historial */}
        {!tieneAjustes ? (
          <p className={styles.emptyText}>
            Sin registros aún. Los ajustes se guardan automáticamente cuando aplicás un porcentaje en la pantalla de Precios.
          </p>
        ) : (
          <div className={styles.historialTable}>
            <div className={styles.historialHeaderRow}>
              <span>Fecha</span>
              <span>Categoría</span>
              <span className={styles.colCenter}>Lista 1</span>
              <span className={styles.colCenter}>Lista 2</span>
              <span className={styles.colCenter}>Lista 3</span>
            </div>
            {historialAjustes.map((row) => (
              <div key={row.id} className={styles.historialRow}>
                <span className={styles.historialFecha}>
                  {formatDate(row.fecha)}
                </span>
                <span className={styles.historialCategoria}>{row.categoria_nombre}</span>
                <span className={cn(styles.colCenter, styles.historialPct, row.ajuste_lista_1 > 0 && styles.pctPos, row.ajuste_lista_1 < 0 && styles.pctNeg)}>
                  {row.ajuste_lista_1 !== 0 ? formatPct(row.ajuste_lista_1) : <span className={styles.pctZero}>—</span>}
                </span>
                <span className={cn(styles.colCenter, styles.historialPct, row.ajuste_lista_2 > 0 && styles.pctPos, row.ajuste_lista_2 < 0 && styles.pctNeg)}>
                  {row.ajuste_lista_2 !== 0 ? formatPct(row.ajuste_lista_2) : <span className={styles.pctZero}>—</span>}
                </span>
                <span className={cn(styles.colCenter, styles.historialPct, row.ajuste_lista_3 > 0 && styles.pctPos, row.ajuste_lista_3 < 0 && styles.pctNeg)}>
                  {row.ajuste_lista_3 !== 0 ? formatPct(row.ajuste_lista_3) : <span className={styles.pctZero}>—</span>}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
