"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type TrabajosSeleccionContextValue = {
  selectedIds: Set<number>;
  toggle: (id: number, checked: boolean) => void;
};

const TrabajosSeleccionContext = createContext<TrabajosSeleccionContextValue | null>(null);

export function TrabajosSeleccionProvider({
  initialIds,
  children,
}: {
  initialIds: number[];
  children: ReactNode;
}) {
  const [selectedIds, setSelectedIds] = useState(() => new Set(initialIds));

  function toggle(id: number, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  return (
    <TrabajosSeleccionContext.Provider value={{ selectedIds, toggle }}>
      {children}
    </TrabajosSeleccionContext.Provider>
  );
}

const noop = () => {};

export function useTrabajosSeleccion(): TrabajosSeleccionContextValue {
  return useContext(TrabajosSeleccionContext) ?? { selectedIds: new Set(), toggle: noop };
}
