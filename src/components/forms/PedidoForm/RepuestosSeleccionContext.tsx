"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type RepuestosSeleccionContextValue = {
  selectedIds: Set<number>;
  toggle: (id: number, checked: boolean) => void;
};

const RepuestosSeleccionContext = createContext<RepuestosSeleccionContextValue | null>(null);

export function RepuestosSeleccionProvider({
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
    <RepuestosSeleccionContext.Provider value={{ selectedIds, toggle }}>
      {children}
    </RepuestosSeleccionContext.Provider>
  );
}

const noop = () => {};

export function useRepuestosSeleccion(): RepuestosSeleccionContextValue {
  return useContext(RepuestosSeleccionContext) ?? {
    selectedIds: new Set(),
    toggle: noop,
  };
}
