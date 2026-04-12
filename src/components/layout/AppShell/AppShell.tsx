"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { MainMenu } from "@/components/navigation/MainMenu";
import { Icon } from "@/components/ui/Icon";
import styles from "./AppShell.module.scss";

type Props = {
  children: React.ReactNode;
  role?: string;
};

export function AppShell({ children, role }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const formattedDate = new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className={styles.shell}>
      {/* Top bar — siempre visible */}
      <header className={styles.topBar}>
        <Link href="/" aria-label="Ir al dashboard">
          <Image
            src="/logo.png"
            alt="Recticar"
            width={110}
            height={36}
            className={styles.topBarLogo}
            priority
          />
        </Link>
        <div className={styles.topBarMeta}>
          <Icon name="calendar" className={styles.topBarMetaIcon} />
          <span className={styles.topBarDate}>{formattedDate}</span>
        </div>
        <button
          type="button"
          className={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          <span className={styles.hamburgerBar} />
          <span className={styles.hamburgerBar} />
          <span className={styles.hamburgerBar} />
        </button>
      </header>

      {/* Fila: sidebar + contenido */}
      <div className={styles.body}>
        {/* Backdrop mobile */}
        <div
          className={cn(styles.backdrop, menuOpen && styles.backdropVisible)}
          onClick={closeMenu}
          aria-hidden="true"
        />

        {/* Sidebar */}
        <aside
          className={cn(styles.sidebar, menuOpen && styles.sidebarOpen)}
          aria-label="Navegación principal"
        >
          <div className={styles.sidebarInner}>
            <MainMenu role={role} onClose={closeMenu} />
          </div>
        </aside>

        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
