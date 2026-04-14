"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type RepuestoSeleccionItem = {
  precioUnitario: number;
  cantidad: number;
};

type RepuestosSeleccionContextValue = {
  selectedIds: Set<number>;
  selectedItems: Record<number, RepuestoSeleccionItem>;
  toggle: (id: number, checked: boolean) => void;
  setPrecioUnitario: (id: number, precio: number) => void;
  incrementCantidad: (id: number) => void;
  decrementCantidad: (id: number) => void;
};

const RepuestosSeleccionContext = createContext<RepuestosSeleccionContextValue | null>(null);

export function RepuestosSeleccionProvider({
  initialItems,
  children,
}: {
  initialItems: Array<{ repuestoId: number; precioUnitario: number; cantidad: number }>;
  children: ReactNode;
}) {
  const [selectedItems, setSelectedItems] = useState<Record<number, RepuestoSeleccionItem>>(() =>
    Object.fromEntries(
      initialItems.map((item) => [
        item.repuestoId,
        {
          precioUnitario: item.precioUnitario,
          cantidad: item.cantidad,
        },
      ])
    )
  );

  const selectedIds = useMemo(
    () => new Set(Object.keys(selectedItems).map((id) => Number(id))),
    [selectedItems]
  );

  function toggle(id: number, checked: boolean) {
    setSelectedItems((prev) => {
      if (checked) {
        return {
          ...prev,
          [id]: prev[id] ?? { precioUnitario: 0, cantidad: 1 },
        };
      }

      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function setPrecioUnitario(id: number, precio: number) {
    setSelectedItems((prev) => ({
      ...prev,
      [id]: {
        precioUnitario: Number.isFinite(precio) && precio >= 0 ? precio : 0,
        cantidad: prev[id]?.cantidad ?? 1,
      },
    }));
  }

  function incrementCantidad(id: number) {
    setSelectedItems((prev) => ({
      ...prev,
      [id]: {
        precioUnitario: prev[id]?.precioUnitario ?? 0,
        cantidad: (prev[id]?.cantidad ?? 1) + 1,
      },
    }));
  }

  function decrementCantidad(id: number) {
    setSelectedItems((prev) => ({
      ...prev,
      [id]: {
        precioUnitario: prev[id]?.precioUnitario ?? 0,
        cantidad: Math.max(1, (prev[id]?.cantidad ?? 1) - 1),
      },
    }));
  }

  return (
    <RepuestosSeleccionContext.Provider
      value={{ selectedIds, selectedItems, toggle, setPrecioUnitario, incrementCantidad, decrementCantidad }}
    >
      {children}
    </RepuestosSeleccionContext.Provider>
  );
}

const noopToggle: RepuestosSeleccionContextValue["toggle"] = () => {};
const noopSetPrecio: RepuestosSeleccionContextValue["setPrecioUnitario"] = () => {};
const noopCantidad: RepuestosSeleccionContextValue["incrementCantidad"] = () => {};

export function useRepuestosSeleccion(): RepuestosSeleccionContextValue {
  return useContext(RepuestosSeleccionContext) ?? {
    selectedIds: new Set(),
    selectedItems: {},
    toggle: noopToggle,
    setPrecioUnitario: noopSetPrecio,
    incrementCantidad: noopCantidad,
    decrementCantidad: noopCantidad,
  };
}
