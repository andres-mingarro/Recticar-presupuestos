import { Icon, type IconName } from "@/components/ui/Icon";
import styles from "./MetricCard.module.scss";

type Props = {
  label: string;
  value: string;
  detail: string;
  icon: IconName;
};

export function MetricCard({ label, value, detail, icon }: Props) {
  return (
    <article className={`MetricCard ${styles.MetricCard}`}>
      <span className={styles.icon} aria-hidden="true">
        <Icon name={icon} />
      </span>
      <div className={styles.body}>
        <p className={styles.label}>{label}</p>
        <strong className={styles.value}>{value}</strong>
        <span className={styles.detail}>{detail}</span>
      </div>
    </article>
  );
}
