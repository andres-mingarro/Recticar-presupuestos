"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { Header } from "@/components/layout/Header";
import { AppShellBody } from "@/components/layout/AppShellBody";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppMain } from "@/components/layout/AppMain";
import { MobileActionsProvider, MobileActions } from "@/components/layout/MobileActions";
import styles from "./AppShell.module.scss";

type Props = {
  children: ReactNode;
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
        <Header />
        <AppShellBody>
          <AppSidebar role={role} permisos={permisos} />
          <AppMain>{children}</AppMain>
        </AppShellBody>
        <MobileActions />
      </div>
    </MobileActionsProvider>
  );
}
