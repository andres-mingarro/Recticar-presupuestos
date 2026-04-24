import { cn } from "@/lib/cn";
import { MainMenu } from "@/components/navigation/MainMenu";
import styles from "./AppSidebar.module.scss";

type Props = {
  className?: string;
  role?: string;
  permisos?: string[];
};

export function AppSidebar({ className, role, permisos }: Props) {
  return (
    <aside
      className={cn("AppSidebar", styles.AppSidebar, className)}
      aria-label="Navegación principal"
    >
      <div className={styles.inner}>
        <MainMenu role={role} permisos={permisos} />
      </div>
    </aside>
  );
}
