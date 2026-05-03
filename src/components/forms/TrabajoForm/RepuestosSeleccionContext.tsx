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

type RepuestoSeleccionInitialItem = {
  repuestoId: number;
  precioUnitario: number;
  cantidad: number;
  precioStock: number;
  cantidadStock: number;
};

type RepuestosSeleccionContextValue = {
  selectedIds: Set<number>;
  selectedItems: Record<number, RepuestoSeleccionItem>;
  toggle: (id: number, checked: boolean, precioStockCatalogo?: number, precioUnitarioCatalogo?: number) => void;
  setPrecioUnitario: (id: number, precio: number) => void;
  setPrecioStock: (id: number, precio: number) => void;
  incrementCantidad: (id: number) => void;
  decrementCantidad: (id: number) => void;
  resetItems: (items: RepuestoSeleccionInitialItem[]) => void;
};

const RepuestosSeleccionContext = createContext<RepuestosSeleccionContextValue | null>(null);

function toRecord(items: RepuestoSeleccionInitialItem[]): Record<number, RepuestoSeleccionItem> {
  return Object.fromEntries(
    items.map((item) => [
      item.repuestoId,
      {
        precioUnitario: item.precioUnitario,
        cantidad: item.cantidad,
        precioStock: item.precioStock,
        cantidadStock: item.cantidadStock,
      },
    ])
  );
}

export function RepuestosSeleccionProvider({
  initialItems,
  children,
}: {
  initialItems: RepuestoSeleccionInitialItem[];
  children: ReactNode;
}) {
  // allItems guarda datos de todos los repuestos tocados, seleccionados o no
  const [allItems, setAllItems] = useState<Record<number, RepuestoSeleccionItem>>(() =>
    toRecord(initialItems)
  );
  // selectedIds trackea cuáles están activos
  const [selectedIds, setSelectedIds] = useState<Set<number>>(
    () => new Set(initialItems.map((item) => item.repuestoId))
  );

  const selectedItems = useMemo(
    () =>
      Object.fromEntries(
        Array.from(selectedIds).map((id) => [id, allItems[id]]).filter(([, v]) => v != null)
      ) as Record<number, RepuestoSeleccionItem>,
    [selectedIds, allItems]
  );

  function toggle(id: number, checked: boolean, precioStockCatalogo = 0, precioUnitarioCatalogo = 0) {
    if (checked) {
      setAllItems((prev) => ({
        ...prev,
        [id]: prev[id] ?? {
          precioUnitario: precioUnitarioCatalogo,
          cantidad: 1,
          precioStock: precioStockCatalogo,
          cantidadStock: 0,
        },
      }));
      setSelectedIds((prev) => new Set([...prev, id]));
    } else {
      // Solo quita de seleccionados; allItems conserva los datos
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  function setPrecioUnitario(id: number, precio: number) {
    setAllItems((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        precioUnitario: Number.isFinite(precio) && precio >= 0 ? precio : 0,
        cantidad: prev[id]?.cantidad ?? 0,
        precioStock: prev[id]?.precioStock ?? 0,
        cantidadStock: prev[id]?.cantidadStock ?? 0,
      },
    }));
  }

  function setPrecioStock(id: number, precio: number) {
    setAllItems((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        precioStock: Number.isFinite(precio) && precio >= 0 ? precio : 0,
      },
    }));
  }

  function incrementCantidad(id: number) {
    setAllItems((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        precioUnitario: prev[id]?.precioUnitario ?? 0,
        cantidad: (prev[id]?.cantidad ?? 0) + 1,
        precioStock: prev[id]?.precioStock ?? 0,
        cantidadStock: prev[id]?.cantidadStock ?? 0,
      },
    }));
  }

  function decrementCantidad(id: number) {
    setAllItems((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        precioUnitario: prev[id]?.precioUnitario ?? 0,
        cantidad: Math.max(0, (prev[id]?.cantidad ?? 0) - 1),
        precioStock: prev[id]?.precioStock ?? 0,
        cantidadStock: prev[id]?.cantidadStock ?? 0,
      },
    }));
  }

  function resetItems(items: RepuestoSeleccionInitialItem[]) {
    setAllItems(toRecord(items));
    setSelectedIds(new Set(items.map((item) => item.repuestoId)));
  }

  return (
    <RepuestosSeleccionContext.Provider
      value={{ selectedIds, selectedItems, toggle, setPrecioUnitario, setPrecioStock, incrementCantidad, decrementCantidad, resetItems }}
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
