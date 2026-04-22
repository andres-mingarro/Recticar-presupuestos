"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { MobileMenu } from "./components/MobileMenu";
import { useMobileActions } from "./MobileActionsContext";
import styles from "./MobileActions.module.scss";

const SWIPE_THRESHOLD = 40;

export function MobileActions() {
  const { actions, menuOpen, setMenuOpen, role, permisos } = useMobileActions();
  const router = useRouter();
  const touchStartY = useRef<number | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartY.current === null) return;
    const delta = touchStartY.current - e.changedTouches[0].clientY;
    if (delta > SWIPE_THRESHOLD && !menuOpen) {
      setMenuOpen(true);
    }
    touchStartY.current = null;
  }

  return (
    <>
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        role={role}
        permisos={permisos}
      />

      <div
        className={cn("MobileActions", styles.bar)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
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
