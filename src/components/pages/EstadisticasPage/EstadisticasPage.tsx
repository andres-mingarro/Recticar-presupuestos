"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { buttonStyles } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { CobradoMensualRow, CobradoAnualRow } from "@/lib/queries/estadisticas";
import type { AjusteListaPreciosRow } from "@/lib/queries/ajustes";
import type { EstadisticasOperativas } from "@/lib/types";
import { DistributionCard } from "./components/DistributionCard";
import { MetricCard } from "./components/MetricCard";
import { RankingCard } from "./components/RankingCard";
import { WorkflowChart } from "./components/WorkflowChart";
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
  estadisticasOperativas: EstadisticasOperativas;
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

function formatCurrency(value: number) {
  return CURRENCY_FORMATTER.format(value);
}

function variacionPct(actual: number, anterior: number) {
  if (anterior === 0) return null;
  return ((actual - anterior) / anterior) * 100;
}

function formatVariacion(actual: number, anterior: number) {
  const variacion = variacionPct(actual, anterior);
  if (variacion === null) return "Sin base de comparación";
  return `${variacion > 0 ? "+" : ""}${variacion.toFixed(1)}%`;
}

export function EstadisticasPage({
  anioSeleccionado,
  aniosDisponibles,
  datosMensuales,
  resumenAnual,
  historialAjustes,
  estadisticasOperativas,
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
  const { resumen, comparacion } = estadisticasOperativas;
  const mesReferencia = comparacion.mesReferencia
    ? MESES_ABREV[comparacion.mesReferencia - 1]
    : null;

  return (
    <div className={cn("EstadisticasPage", styles.EstadisticasPage, "space-y-7")}>
      <PageHeader
        eyebrow="Registros"
        title="Estadísticas"
        description="Trabajos cobrados por período"
        actions={
          <Link
            href="/estadisticas/datos"
            data-variant="outline-dark"
            className={buttonStyles({ size: "sm", className: "gap-2" })}
          >
            <Icon name="link" className="size-3.5" />
            Mapa de datos
          </Link>
        }
      />

      <section className={styles.section} aria-labelledby="panorama-title">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.sectionEyebrow}>Panorama</p>
            <h2 id="panorama-title" className={styles.sectionTitle}>Indicadores de {anioSeleccionado}</h2>
          </div>
          <p className={styles.sectionDescription}>
            Operación, conversión y cobros calculados con los registros del período.
          </p>
        </div>
        <div className={styles.metricGrid}>
          <MetricCard
            label="Trabajos ingresados"
            value={MONTO_FORMATTER.format(resumen.creados)}
            detail={`Órdenes creadas en ${anioSeleccionado}`}
            icon="clipboardList"
          />
          <MetricCard
            label="Tasa de aprobación"
            value={`${resumen.tasaAprobacion.toFixed(1)}%`}
            detail={`${resumen.aprobados} con fecha de aprobación`}
            icon="check"
          />
          <MetricCard
            label="Tiempo de aprobación"
            value={resumen.promedioDiasAprobacion === null ? "—" : `${resumen.promedioDiasAprobacion} días`}
            detail="Promedio desde el ingreso"
            icon="clock"
          />
          <MetricCard
            label="Ticket promedio"
            value={resumen.ticketPromedio > 0 ? formatCurrency(resumen.ticketPromedio) : "—"}
            detail="Promedio por trabajo cobrado"
            icon="sackDollar"
          />
          <MetricCard
            label="Pendientes de cobro"
            value={MONTO_FORMATTER.format(resumen.pendientesCobro)}
            detail="Aprobados o finalizados sin cobrar"
            icon="sackXmark"
          />
          <MetricCard
            label="Importe pendiente"
            value={resumen.montoPendiente > 0 ? formatCurrency(resumen.montoPendiente) : "—"}
            detail="Valor de órdenes aprobadas sin cobrar"
            icon="calendar"
          />
        </div>
      </section>

      <WorkflowChart anio={anioSeleccionado} rows={estadisticasOperativas.mensual} />

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

      <section className={styles.section} aria-labelledby="comparaciones-title">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.sectionEyebrow}>Evolución</p>
            <h2 id="comparaciones-title" className={styles.sectionTitle}>
              Comparaciones {mesReferencia ? `de ${mesReferencia}` : ""}
            </h2>
          </div>
          <p className={styles.sectionDescription}>
            Se toma el último mes con cobros del año seleccionado.
          </p>
        </div>
        <div className={styles.comparisonGrid}>
          <Card className={styles.comparisonCard}>
            <span className={styles.comparisonLabel}>Frente al mes anterior</span>
            <strong className={styles.comparisonValue}>
              {formatVariacion(comparacion.totalMes, comparacion.totalMesAnterior)}
            </strong>
            <span className={styles.comparisonDetail}>
              {formatCurrency(comparacion.totalMes)} vs. {formatCurrency(comparacion.totalMesAnterior)}
            </span>
          </Card>
          <Card className={styles.comparisonCard}>
            <span className={styles.comparisonLabel}>Mismo mes del año anterior</span>
            <strong className={styles.comparisonValue}>
              {formatVariacion(comparacion.totalMes, comparacion.totalMismoMesAnterior)}
            </strong>
            <span className={styles.comparisonDetail}>
              {formatCurrency(comparacion.totalMes)} vs. {formatCurrency(comparacion.totalMismoMesAnterior)}
            </span>
          </Card>
          <Card className={styles.comparisonCard}>
            <span className={styles.comparisonLabel}>Cantidad cobrada</span>
            <strong className={styles.comparisonValue}>{comparacion.cantidadMes}</strong>
            <span className={styles.comparisonDetail}>
              Anterior: {comparacion.cantidadMesAnterior} · Interanual: {comparacion.cantidadMismoMesAnterior}
            </span>
          </Card>
        </div>
      </section>

      <div className={styles.distributionGrid}>
        <DistributionCard
          eyebrow="Situación actual"
          title="Trabajos por estado"
          icon="listCheck"
          rows={estadisticasOperativas.estados}
          labels={{
            presupuesto_entregado: "Presupuesto entregado",
            aprobado: "Presupuesto aceptado",
          }}
          getHref={(estado) => `/trabajos?estado=${estado}&prioridad=&numero=`}
        />
        <DistributionCard
          eyebrow="Organización"
          title="Trabajos por prioridad"
          icon="gauge"
          rows={estadisticasOperativas.prioridades}
          labels={{ alta: "Alta", normal: "Normal", baja: "Baja" }}
          getHref={(prioridad) => `/trabajos?estado=&prioridad=${prioridad}&numero=`}
        />
        <DistributionCard
          eyebrow="Presupuestos"
          title="Uso de listas de precios"
          icon="clipboardList"
          rows={estadisticasOperativas.listasPrecio}
          labels={{ "1": "Lista 1", "2": "Lista 2", "3": "Lista 3", "4": "Lista 4", "5": "Lista 5" }}
        />
        <DistributionCard
          eyebrow="Facturación"
          title="Cobrados con y sin IVA"
          icon="sackDollar"
          rows={estadisticasOperativas.iva}
          labels={{ con_iva: "Con IVA", sin_iva: "Sin IVA" }}
          formatTotal={formatCurrency}
        />
      </div>

      <section className={styles.section} aria-labelledby="rankings-title">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.sectionEyebrow}>Detalle</p>
            <h2 id="rankings-title" className={styles.sectionTitle}>Actividad cobrada</h2>
          </div>
          <p className={styles.sectionDescription}>
            Rankings construidos con nombres y precios guardados en cada orden.
          </p>
        </div>
        <div className={styles.rankingGrid}>
          <RankingCard
            eyebrow="Servicios"
            title="Trabajos más solicitados"
            icon="listCheck"
            description="Ítems incluidos en órdenes cobradas."
            rows={estadisticasOperativas.trabajosSolicitados}
            quantityLabel="Unidades"
            totalLabel="Importe base"
            formatTotal={formatCurrency}
          />
          <RankingCard
            eyebrow="Ingresos"
            title="Ingresos por categoría"
            icon="chartBar"
            description="Servicios cobrados, sin repuestos ni IVA."
            rows={estadisticasOperativas.ingresosCategorias}
            quantityLabel="Unidades"
            totalLabel="Importe base"
            formatTotal={formatCurrency}
          />
          <RankingCard
            eyebrow="Repuestos"
            title="Repuestos más utilizados"
            icon="package"
            description="Unidades e importe incluidos en órdenes cobradas."
            rows={estadisticasOperativas.repuestosUtilizados}
            quantityLabel="Unidades"
            totalLabel="Importe"
            formatTotal={formatCurrency}
          />
          <RankingCard
            eyebrow="Clientes"
            title="Clientes con más trabajos finalizados"
            icon="user"
            description="Ranking histórico; incluye trabajos cobrados y trabajos realizados sin cobro."
            rows={estadisticasOperativas.clientesPrincipales}
            quantityLabel="Trabajos"
            totalLabel="Importe cobrado"
            formatTotal={formatCurrency}
            linkBasePath="/clientes"
          />
        </div>
      </section>

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
              {([1, 2, 3, 4, 5] as const).map((n) => (
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
                  [row.mes_lista_4, row.anio_lista_4, row.doce_meses_lista_4],
                  [row.mes_lista_5, row.anio_lista_5, row.doce_meses_lista_5],
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
