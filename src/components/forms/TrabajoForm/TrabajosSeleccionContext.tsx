"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { ListaPrecio } from "@/lib/db";

type TrabajosSeleccionContextValue = {
  selectedIds: Set<number>;
  cantidades: Record<number, number>;
  toggle: (id: number, checked: boolean) => void;
  incrementCantidad: (id: number) => void;
  decrementCantidad: (id: number) => void;
  listaPrecios: ListaPrecio;
  setListaPrecios: (lista: ListaPrecio) => void;
};

const TrabajosSeleccionContext = createContext<TrabajosSeleccionContextValue | null>(null);

const EMPTY_CANTIDADES: Record<number, number> = {};

export function TrabajosSeleccionProvider({
  initialIds,
  initialCantidades = EMPTY_CANTIDADES,
  initialListaPrecios = 1,
  children,
}: {
  initialIds: number[];
  initialCantidades?: Record<number, number>;
  initialListaPrecios?: ListaPrecio;
  children: ReactNode;
}) {
  const [selectedIds, setSelectedIds] = useState(() => new Set(initialIds));
  const [cantidades, setCantidades] = useState<Record<number, number>>(() => {
    const base: Record<number, number> = {};
    for (const id of initialIds) {
      base[id] = initialCantidades[id] ?? 1;
    }
    return base;
  });
  const [listaPrecios, setListaPrecios] = useState<ListaPrecio>(initialListaPrecios);

  function toggle(id: number, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
    if (checked) {
      setCantidades((prev) => ({
        ...prev,
        [id]: prev[id] ?? 1,
      }));
    }
  }

  function incrementCantidad(id: number) {
    setCantidades((prev) => ({ ...prev, [id]: (prev[id] ?? 1) + 1 }));
  }

  function decrementCantidad(id: number) {
    setCantidades((prev) => ({ ...prev, [id]: Math.max(1, (prev[id] ?? 1) - 1) }));
  }

  return (
    <TrabajosSeleccionContext.Provider value={{ selectedIds, cantidades, toggle, incrementCantidad, decrementCantidad, listaPrecios, setListaPrecios }}>
      {children}
    </TrabajosSeleccionContext.Provider>
  );
}

export function useTrabajosSeleccion(): TrabajosSeleccionContextValue {
  const ctx = useContext(TrabajosSeleccionContext);
  if (!ctx) throw new Error("useTrabajosSeleccion must be used inside TrabajosSeleccionProvider");
  return ctx;
}
