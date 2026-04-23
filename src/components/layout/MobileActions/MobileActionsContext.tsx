"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type MobileActionsContextValue = {
  actions: ReactNode;
  setActions: (node: ReactNode) => void;
  openMenu: () => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  role?: string;
  permisos?: string[];
  mobileTotal: number | null;
  setMobileTotal: (total: number | null) => void;
};

export const MobileActionsContext = createContext<MobileActionsContextValue>({
  actions: null,
  setActions: () => {},
  openMenu: () => {},
  menuOpen: false,
  setMenuOpen: () => {},
  mobileTotal: null,
  setMobileTotal: () => {},
});

export function MobileActionsProvider({
  children,
  onOpenMenu,
  menuOpen,
  setMenuOpen,
  role,
  permisos,
}: {
  children: ReactNode;
  onOpenMenu: () => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  role?: string;
  permisos?: string[];
}) {
  const [actions, setActionsState] = useState<ReactNode>(null);
  const [mobileTotal, setMobileTotal] = useState<number | null>(null);

  const setActions = useCallback((node: ReactNode) => {
    setActionsState(node);
  }, []);

  return (
    <MobileActionsContext.Provider value={{ actions, setActions, openMenu: onOpenMenu, menuOpen, setMenuOpen, role, permisos, mobileTotal, setMobileTotal }}>
      {children}
    </MobileActionsContext.Provider>
  );
}

export function useMobileActions() {
  return useContext(MobileActionsContext);
}
