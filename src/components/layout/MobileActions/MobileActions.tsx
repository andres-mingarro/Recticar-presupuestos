"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { MobileMenu } from "./components/MobileMenu";
import { useMobileActions } from "./MobileActionsContext";
import styles from "./MobileActions.module.scss";

export function MobileActions() {
  const { actions, menuOpen, setMenuOpen, role, permisos } = useMobileActions();
  const router = useRouter();

  return (
    <>
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        role={role}
        permisos={permisos}
      />

      <div className={cn("MobileActions", styles.bar)}>
        {/* Atrás */}
        <button
          type="button"
          className={styles.btnBack}
          onClick={() => router.back()}
          aria-label="Volver"
        >
          <Icon name="chevronLeft" className="h-5 w-5" />
        </button>

        {/* Acciones de la página actual — crecen en el medio */}
        <div className={styles.actions}>
          {actions}
        </div>

        {/* Menú hamburguesa — siempre a la derecha */}
        <button
          type="button"
          className={styles.btnMenu}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menú"
        >
          <Icon name="menu" className="h-5 w-5" />
        </button>
      </div>
    </>
  );
}
