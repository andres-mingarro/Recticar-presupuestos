import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import styles from "./Date.module.scss";

export function Date({ className }: { className?: string }) {
  const formattedDate = new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new globalThis.Date());

  return (
    <div className={cn("Date", styles.date, "flex items-center justify-center", className)}>
      <Icon name="calendar" className={styles.icon} />
      <span className={styles.value}>{formattedDate}</span>
    </div>
  );
}
