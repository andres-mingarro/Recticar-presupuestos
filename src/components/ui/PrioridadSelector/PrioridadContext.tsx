"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { PedidoPrioridad } from "@/lib/types";

type PrioridadContextValue = {
  prioridad: PedidoPrioridad;
  setPrioridad: (v: PedidoPrioridad) => void;
};

const PrioridadContext = createContext<PrioridadContextValue | null>(null);

export function PrioridadProvider({
  initialValue,
  children,
}: {
  initialValue: PedidoPrioridad;
  children: ReactNode;
}) {
  const [prioridad, setPrioridad] = useState(initialValue);
  return (
    <PrioridadContext value={{ prioridad, setPrioridad }}>
      {children}
    </PrioridadContext>
  );
}

export function usePrioridad() {
  const ctx = useContext(PrioridadContext);
  if (!ctx) throw new Error("usePrioridad must be used inside PrioridadProvider");
  return ctx;
}
