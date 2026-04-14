import { toIntegerPrice } from "@/lib/format";
import type { PedidoRepuestoValue } from "@/lib/types";

export function parsePedidoRepuestos(formData: FormData): PedidoRepuestoValue[] {
  return formData
    .getAll("repuestosIds")
    .filter((value): value is string => typeof value === "string")
    .map((repuestoId) => {
      const precio = Number(formData.get(`repuestoPrecio_${repuestoId}`));
      const cantidad = Number(formData.get(`repuestoCantidad_${repuestoId}`));

      return {
        repuestoId,
        precioUnitario: toIntegerPrice(precio),
        cantidad: Number.isFinite(cantidad) && cantidad >= 1 ? Math.trunc(cantidad) : 1,
      };
    });
}
