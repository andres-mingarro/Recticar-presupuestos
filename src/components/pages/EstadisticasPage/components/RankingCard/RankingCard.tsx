import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { EstadisticaCliente, EstadisticaRanking } from "@/lib/types";
import styles from "./RankingCard.module.scss";

type Row = EstadisticaRanking | EstadisticaCliente;

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  rows: Row[];
  quantityLabel: string;
  totalLabel: string;
  formatTotal: (value: number) => string;
  linkBasePath?: string;
  icon: IconName;
};

function hasCategory(row: Row): row is EstadisticaRanking {
  return "categoria" in row;
}

export function RankingCard({
  eyebrow,
  title,
  description,
  rows,
  quantityLabel,
  totalLabel,
  formatTotal,
  linkBasePath,
  icon,
}: Props) {
  return (
    <Card as="section" className={`RankingCard ${styles.RankingCard}`}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.description}>{description}</p>
        </div>
        <span className={styles.headerIcon} aria-hidden="true">
          <Icon name={icon} />
        </span>
      </header>
      {rows.length === 0 ? (
        <p className={styles.empty}>Sin datos para el período.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">{quantityLabel}</th>
                <th scope="col">{totalLabel}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${row.id ?? "sin-id"}-${row.nombre}-${index}`}>
                  <td>
                    {linkBasePath && row.id !== null ? (
                      <Link
                        href={`${linkBasePath}/${row.id}`}
                        className={styles.nameLink}
                        aria-label={`Ver detalle de ${row.nombre}`}
                      >
                        {row.nombre}
                      </Link>
                    ) : (
                      <span className={styles.name}>{row.nombre}</span>
                    )}
                    {hasCategory(row) && row.categoria && (
                      <span className={styles.category}>{row.categoria}</span>
                    )}
                  </td>
                  <td className={styles.number}>{row.cantidad}</td>
                  <td className={styles.number}>{formatTotal(row.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
