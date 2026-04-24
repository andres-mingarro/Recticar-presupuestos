"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import type { CobradoMensualRow, CobradoAnualRow } from "@/lib/queries/estadisticas";
import styles from "./EstadisticasPage.module.scss";

const MESES_ABREV = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

type Props = {
  anioSeleccionado: number;
  aniosDisponibles: number[];
  datosMensuales: CobradoMensualRow[];
  resumenAnual: CobradoAnualRow[];
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

export function EstadisticasPage({ anioSeleccionado, aniosDisponibles, datosMensuales, resumenAnual }: Props) {
  const searchParams = useSearchParams();
  const totalAnio = datosMensuales.reduce((acc, m) => acc + m.cantidad, 0);

  const aniosParaMostrar = aniosDisponibles.length > 0 ? aniosDisponibles : [anioSeleccionado];

  function buildAnoUrl(anio: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("año", String(anio));
    return `/estadisticas?${params.toString()}`;
  }

  return (
    <div className={cn("EstadisticasPage", styles.EstadisticasPage, "space-y-7")}>
      <PageHeader
        eyebrow="Registros"
        title="Estadísticas"
        description="Trabajos cobrados por período"
      />

      <div className={styles.grid}>
        {/* Gráfico mensual */}
        <Card className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div className={styles.chartTitleGroup}>
              <h2 className={styles.cardTitle}>Trabajos cobrados</h2>
              <span className={styles.chartSubtitle}>Registro mensual</span>
            </div>

            {/* Selector de año */}
            <div className={styles.yearSelector}>
              {aniosParaMostrar.map((anio) => (
                <Link
                  key={anio}
                  href={buildAnoUrl(anio)}
                  className={cn(
                    styles.yearBtn,
                    anio === anioSeleccionado && styles.yearBtnActive
                  )}
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

        {/* Resumen anual */}
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
              {resumenAnual.map((row) => {
                const isSelected = row.anio === anioSeleccionado;
                return (
                  <Link
                    key={row.anio}
                    href={buildAnoUrl(row.anio)}
                    className={cn(styles.summaryRow, isSelected && styles.summaryRowActive)}
                  >
                    <span className={styles.summaryAnio}>{row.anio}</span>
                    <span className={styles.summaryCantidad}>{row.cantidad}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
