import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { EstadisticaDistribucion } from "@/lib/types";
import styles from "./DistributionCard.module.scss";

type Props = {
  eyebrow: string;
  title: string;
  rows: EstadisticaDistribucion[];
  labels: Record<string, string>;
  formatTotal?: (value: number) => string;
  getHref?: (key: string) => string;
  icon: IconName;
};

export function DistributionCard({ eyebrow, title, rows, labels, formatTotal, getHref, icon }: Props) {
  const total = rows.reduce((sum, row) => sum + row.cantidad, 0);
  const max = Math.max(...rows.map((row) => row.cantidad), 1);

  return (
    <Card as="section" className={`DistributionCard ${styles.DistributionCard}`}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h2 className={styles.title}>{title}</h2>
        </div>
        <span className={styles.headerIcon} aria-hidden="true">
          <Icon name={icon} />
        </span>
      </header>
      {rows.length === 0 ? (
        <p className={styles.empty}>Sin datos para el período.</p>
      ) : (
        <div className={styles.rows}>
          {rows.map((row) => {
            const content = (
              <>
              <span className={styles.label}>{labels[row.clave] ?? row.clave}</span>
              <strong className={styles.value}>
                {row.cantidad}
                {total > 0 ? ` · ${Math.round((row.cantidad / total) * 100)}%` : ""}
              </strong>
              {formatTotal && row.total !== undefined && (
                <span className={styles.total}>{formatTotal(row.total)}</span>
              )}
              <span className={styles.track} aria-hidden="true">
                <span className={styles.bar} style={{ width: `${(row.cantidad / max) * 100}%` }} />
              </span>
              </>
            );
            const href = getHref?.(row.clave);

            return href ? (
              <Link
                className={`${styles.row} ${styles.rowInteractive}`}
                href={href}
                key={row.clave}
                aria-label={`Ver trabajos con prioridad ${labels[row.clave] ?? row.clave}`}
              >
                {content}
                <span className={styles.linkIcon} aria-hidden="true">
                  <Icon name="link" />
                </span>
              </Link>
            ) : (
              <div className={styles.row} key={row.clave}>
                {content}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
