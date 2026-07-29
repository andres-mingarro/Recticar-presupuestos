import { Card } from "@/components/ui/Card";
import type { EstadisticaMensual } from "@/lib/types";
import styles from "./WorkflowChart.module.scss";

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

type Props = {
  anio: number;
  rows: EstadisticaMensual[];
};

export function WorkflowChart({ anio, rows }: Props) {
  const max = Math.max(...rows.flatMap((row) => [row.creados, row.cobrados]), 1);
  const creados = rows.reduce((sum, row) => sum + row.creados, 0);
  const cobrados = rows.reduce((sum, row) => sum + row.cobrados, 0);

  return (
    <Card as="section" className={`WorkflowChart ${styles.WorkflowChart}`}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Flujo mensual</p>
          <h2 className={styles.title}>Ingresos y cobros</h2>
        </div>
        <div className={styles.legend} aria-label="Referencias del gráfico">
          <span className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.createdDot}`} aria-hidden="true" />
            Ingresados
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.chargedDot}`} aria-hidden="true" />
            Cobrados
          </span>
        </div>
      </header>
      <div
        className={styles.scroll}
        role="img"
        aria-label={`${creados} trabajos ingresados y ${cobrados} cobrados durante ${anio}, desglosados por mes`}
      >
        <div className={styles.chart}>
          {rows.map((row) => (
            <div className={styles.column} key={row.mes}>
              <div className={styles.bars}>
                <span className={styles.barGroup} title={`${MESES[row.mes - 1]}: ${row.creados} ingresados`}>
                  <span className={styles.barValue}>{row.creados || ""}</span>
                  <span
                    className={`${styles.bar} ${styles.createdBar}`}
                    style={{ height: row.creados ? `${Math.max((row.creados / max) * 100, 4)}%` : 0 }}
                  />
                </span>
                <span className={styles.barGroup} title={`${MESES[row.mes - 1]}: ${row.cobrados} cobrados`}>
                  <span className={styles.barValue}>{row.cobrados || ""}</span>
                  <span
                    className={`${styles.bar} ${styles.chargedBar}`}
                    style={{ height: row.cobrados ? `${Math.max((row.cobrados / max) * 100, 4)}%` : 0 }}
                  />
                </span>
              </div>
              <span className={styles.month}>{MESES[row.mes - 1]}</span>
            </div>
          ))}
        </div>
      </div>
      <p className={styles.summary}>
        El mes de ingreso y el mes de cobro pueden ser distintos. Las barras muestran ambos movimientos reales.
      </p>
    </Card>
  );
}
