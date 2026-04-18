"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { TrabajoPrioridad } from "@/lib/types";

type PrioridadContextValue = {
  prioridad: TrabajoPrioridad;
  setPrioridad: (v: TrabajoPrioridad) => void;
};

const PrioridadContext = createContext<PrioridadContextValue | null>(null);

export function PrioridadProvider({
  initialValue,
  children,
}: {
  initialValue: TrabajoPrioridad;
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
