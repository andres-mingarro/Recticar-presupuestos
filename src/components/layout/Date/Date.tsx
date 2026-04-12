import { Icon } from "@/components/ui/Icon";
import styles from "./Date.module.scss";

export function Date() {
  const formattedDate = new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new globalThis.Date());

  return (
    <div className={styles.date}>
      <Icon name="calendar" className={styles.icon} />
      <span className={styles.value}>{formattedDate}</span>
    </div>
  );
}
