"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type CobradoContextValue = {
  cobrado: boolean;
  setCobrado: (v: boolean) => void;
};

const CobradoContext = createContext<CobradoContextValue | null>(null);

export function CobradoProvider({
  initialValue,
  children,
}: {
  initialValue: boolean;
  children: ReactNode;
}) {
  const [cobrado, setCobrado] = useState(initialValue);
  return (
    <CobradoContext value={{ cobrado, setCobrado }}>
      {children}
    </CobradoContext>
  );
}

export function useCobrado() {
  const ctx = useContext(CobradoContext);
  if (!ctx) throw new Error("useCobrado must be used inside CobradoProvider");
  return ctx;
}
