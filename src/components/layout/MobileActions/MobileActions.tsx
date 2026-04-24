"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { HamburgerButton } from "@/components/layout/HamburgerButton";
import { MobileMenu } from "./components/MobileMenu";
import { useMobileActions } from "./MobileActionsContext";
import { formatPrice } from "@/lib/format";
import styles from "./MobileActions.module.scss";

const SWIPE_THRESHOLD = 40;

export function MobileActions() {
  const { actions, menuOpen, setMenuOpen, role, permisos, mobileTotal } = useMobileActions();
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
      {/* Barra de total — se desliza desde atrás de la bar */}
      <div className={cn(styles.totalBar, mobileTotal !== null && !menuOpen && styles.totalBarVisible)}>
        <span className={styles.totalBarLabel}>Total</span>
        <span className={styles.totalBarAmount}>{mobileTotal !== null ? formatPrice(mobileTotal) : ""}</span>
      </div>
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
        <HamburgerButton
          type="mobileActions"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        />
      </div>
    </>
  );
}
