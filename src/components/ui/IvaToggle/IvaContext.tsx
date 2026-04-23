"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type IvaContextValue = {
  aplicaIva: boolean;
  setAplicaIva: (v: boolean) => void;
};

const IvaContext = createContext<IvaContextValue | null>(null);

export function IvaProvider({
  initialValue,
  children,
}: {
  initialValue: boolean;
  children: ReactNode;
}) {
  const [aplicaIva, setAplicaIva] = useState(initialValue);
  return (
    <IvaContext value={{ aplicaIva, setAplicaIva }}>
      {children}
    </IvaContext>
  );
}

export function useIva() {
  const ctx = useContext(IvaContext);
  if (!ctx) throw new Error("useIva must be used inside IvaProvider");
  return ctx;
}
