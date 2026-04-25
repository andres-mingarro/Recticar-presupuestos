import { toIntegerPrice } from "@/lib/format";
import type { TrabajoRepuestoValue } from "@/lib/types";

export function parseTrabajoRepuestos(formData: FormData): TrabajoRepuestoValue[] {
  return formData
    .getAll("repuestosIds")
    .filter((value): value is string => typeof value === "string")
    .map((repuestoId) => {
      // precio = precio unitario del proveedor (lo que cuesta conseguir el repuesto externamente)
      const precio = Number(formData.get(`repuestoPrecio_${repuestoId}`));
      const cantidad = Number(formData.get(`repuestoCantidad_${repuestoId}`));
      const precioStock = Number(formData.get(`repuestoPrecioStock_${repuestoId}`));
      const cantidadStock = Number(formData.get(`repuestoCantidadStock_${repuestoId}`));

      return {
        repuestoId,
        precioUnitario: toIntegerPrice(precio),
        cantidad: Number.isFinite(cantidad) && cantidad >= 1 ? Math.trunc(cantidad) : 1,
        precioStock: toIntegerPrice(precioStock),
        cantidadStock: Number.isFinite(cantidadStock) && cantidadStock >= 0 ? Math.trunc(cantidadStock) : 0,
      };
    });
}
