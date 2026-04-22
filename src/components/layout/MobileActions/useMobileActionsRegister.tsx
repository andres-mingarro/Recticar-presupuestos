"use client";

import { useEffect, type ReactNode } from "react";
import { useMobileActions } from "./MobileActionsContext";

export function useMobileActionsRegister(actions: ReactNode, deps: unknown[] = []) {
  const { setActions } = useMobileActions();

  useEffect(() => {
    setActions(actions);
    return () => setActions(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
