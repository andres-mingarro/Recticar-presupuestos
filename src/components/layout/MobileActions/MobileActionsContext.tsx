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
};

export const MobileActionsContext = createContext<MobileActionsContextValue>({
  actions: null,
  setActions: () => {},
  openMenu: () => {},
  menuOpen: false,
  setMenuOpen: () => {},
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

  const setActions = useCallback((node: ReactNode) => {
    setActionsState(node);
  }, []);

  return (
    <MobileActionsContext.Provider value={{ actions, setActions, openMenu: onOpenMenu, menuOpen, setMenuOpen, role, permisos }}>
      {children}
    </MobileActionsContext.Provider>
  );
}

export function useMobileActions() {
  return useContext(MobileActionsContext);
}
