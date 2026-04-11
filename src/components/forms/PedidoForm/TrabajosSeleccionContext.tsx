"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type TrabajosSeleccionContextValue = {
  selectedIds: Set<number>;
  toggle: (id: number, checked: boolean) => void;
  listaPrecios: 1 | 2 | 3;
  setListaPrecios: (lista: 1 | 2 | 3) => void;
};

const TrabajosSeleccionContext = createContext<TrabajosSeleccionContextValue | null>(null);

export function TrabajosSeleccionProvider({
  initialIds,
  initialListaPrecios = 1,
  children,
}: {
  initialIds: number[];
  initialListaPrecios?: 1 | 2 | 3;
  children: ReactNode;
}) {
  const [selectedIds, setSelectedIds] = useState(() => new Set(initialIds));
  const [listaPrecios, setListaPrecios] = useState<1 | 2 | 3>(initialListaPrecios);

  function toggle(id: number, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  return (
    <TrabajosSeleccionContext.Provider value={{ selectedIds, toggle, listaPrecios, setListaPrecios }}>
      {children}
    </TrabajosSeleccionContext.Provider>
  );
}

const noop = () => {};

export function useTrabajosSeleccion(): TrabajosSeleccionContextValue {
  return useContext(TrabajosSeleccionContext) ?? {
    selectedIds: new Set(),
    toggle: noop,
    listaPrecios: 1,
    setListaPrecios: noop,
  };
}
