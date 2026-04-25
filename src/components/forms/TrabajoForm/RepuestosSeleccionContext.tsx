"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type RepuestoSeleccionItem = {
  // precio = precio unitario del proveedor (unidades que no salen del stock del taller)
  precioUnitario: number;
  cantidad: number;
  // precio del stock del taller por unidad
  precioStock: number;
  // cuántas unidades salen del stock del taller (0 si no hay stock habilitado o no alcanza)
  cantidadStock: number;
};

type RepuestosSeleccionContextValue = {
  selectedIds: Set<number>;
  selectedItems: Record<number, RepuestoSeleccionItem>;
  // precioStockCatalogo: precio del stock definido en el catálogo, se pasa al hacer toggle
  toggle: (id: number, checked: boolean, precioStockCatalogo?: number) => void;
  setPrecioUnitario: (id: number, precio: number) => void;
  setPrecioStock: (id: number, precio: number) => void;
  incrementCantidad: (id: number) => void;
  decrementCantidad: (id: number) => void;
};

const RepuestosSeleccionContext = createContext<RepuestosSeleccionContextValue | null>(null);

export function RepuestosSeleccionProvider({
  initialItems,
  children,
}: {
  initialItems: Array<{
    repuestoId: number;
    precioUnitario: number;
    cantidad: number;
    precioStock: number;
    cantidadStock: number;
  }>;
  children: ReactNode;
}) {
  const [selectedItems, setSelectedItems] = useState<Record<number, RepuestoSeleccionItem>>(() =>
    Object.fromEntries(
      initialItems.map((item) => [
        item.repuestoId,
        {
          precioUnitario: item.precioUnitario,
          cantidad: item.cantidad,
          precioStock: item.precioStock,
          cantidadStock: item.cantidadStock,
        },
      ])
    )
  );

  const selectedIds = useMemo(
    () => new Set(Object.keys(selectedItems).map((id) => Number(id))),
    [selectedItems]
  );

  function toggle(id: number, checked: boolean, precioStockCatalogo = 0) {
    setSelectedItems((prev) => {
      if (checked) {
        return {
          ...prev,
          [id]: prev[id] ?? {
            precioUnitario: 0,
            cantidad: 1,
            // inicializar con el precio del catálogo al seleccionar por primera vez
            precioStock: precioStockCatalogo,
            cantidadStock: 0,
          },
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
        ...prev[id],
        precioUnitario: Number.isFinite(precio) && precio >= 0 ? precio : 0,
        cantidad: prev[id]?.cantidad ?? 1,
        precioStock: prev[id]?.precioStock ?? 0,
        cantidadStock: prev[id]?.cantidadStock ?? 0,
      },
    }));
  }

  function setPrecioStock(id: number, precio: number) {
    setSelectedItems((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        precioStock: Number.isFinite(precio) && precio >= 0 ? precio : 0,
      },
    }));
  }

  function incrementCantidad(id: number) {
    setSelectedItems((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        precioUnitario: prev[id]?.precioUnitario ?? 0,
        cantidad: (prev[id]?.cantidad ?? 1) + 1,
        precioStock: prev[id]?.precioStock ?? 0,
        cantidadStock: prev[id]?.cantidadStock ?? 0,
      },
    }));
  }

  function decrementCantidad(id: number) {
    setSelectedItems((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        precioUnitario: prev[id]?.precioUnitario ?? 0,
        cantidad: Math.max(1, (prev[id]?.cantidad ?? 1) - 1),
        precioStock: prev[id]?.precioStock ?? 0,
        cantidadStock: prev[id]?.cantidadStock ?? 0,
      },
    }));
  }

  return (
    <RepuestosSeleccionContext.Provider
      value={{ selectedIds, selectedItems, toggle, setPrecioUnitario, setPrecioStock, incrementCantidad, decrementCantidad }}
    >
      {children}
    </RepuestosSeleccionContext.Provider>
  );
}

export function useRepuestosSeleccion(): RepuestosSeleccionContextValue {
  const ctx = useContext(RepuestosSeleccionContext);
  if (!ctx) throw new Error("useRepuestosSeleccion must be used inside RepuestosSeleccionProvider");
  return ctx;
}
