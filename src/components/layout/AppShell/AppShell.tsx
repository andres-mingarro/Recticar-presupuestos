"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { Date } from "@/components/layout/Date";
import { MainMenu } from "@/components/navigation/MainMenu";
import { AppBreadcrumb } from "@/components/ui/Breadcrumb";
import { MobileActionsProvider, MobileActions } from "@/components/layout/MobileActions";
import styles from "./AppShell.module.scss";

type Props = {
  children: React.ReactNode;
  role?: string;
  permisos?: string[];
};

export function AppShell({ children, role, permisos }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <MobileActionsProvider
      onOpenMenu={() => setMenuOpen(true)}
      menuOpen={menuOpen}
      setMenuOpen={setMenuOpen}
      role={role}
      permisos={permisos}
    >
      <div className={cn("AppShell", styles.shell)}>
        {/* Top bar */}
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
          <Date className="hidden md:flex" />
        </header>

        {/* Fila: sidebar + contenido */}
        <div className={styles.body}>
          {/* Sidebar — solo visible en desktop */}
          <aside className={styles.sidebar} aria-label="Navegación principal">
            <div className={styles.sidebarInner}>
              <MainMenu role={role} permisos={permisos} />
            </div>
          </aside>

          <main className={styles.main}>
            <AppBreadcrumb />
            {children}
            {/* Espaciado para que el contenido no quede bajo la barra mobile */}
            <div className={styles.mobileActionsPlaceholder} />
          </main>
        </div>

        {/* Barra mobile sticky + MobileMenu */}
        <MobileActions />
      </div>
    </MobileActionsProvider>
  );
}
