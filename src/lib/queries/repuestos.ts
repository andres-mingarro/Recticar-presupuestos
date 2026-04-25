import { queryRows, templateRows } from "@/lib/db";
import type { RepuestoAgrupado } from "@/lib/types";

export type RepuestoDetalleItem = {
  categoriaId: number | null;
  categoriaNombre: string;
  repuestoId: number | null;
  repuestoNombre: string;
  precioUnitario: number;
  cantidad: number;
  precioStock: number;
  cantidadStock: number;
  total: number;
};

export async function listRepuestosAgrupados() {
  const rows = await templateRows<{
    categoria_id: number;
    categoria_nombre: string;
    repuesto_id: number | null;
    repuesto_nombre: string | null;
    repuesto_precio: number | null;
    stock_habilitado: boolean | null;
    stock_cantidad: number | null;
    precio_stock: number | null;
  }>`
    SELECT
      c.id AS categoria_id,
      c.nombre AS categoria_nombre,
      r.id AS repuesto_id,
      r.nombre AS repuesto_nombre,
      r.precio AS repuesto_precio,
      r.stock_habilitado AS stock_habilitado,
      r.stock_cantidad AS stock_cantidad,
      r.precio_stock AS precio_stock
    FROM categorias_repuesto c
    LEFT JOIN repuestos r ON r.categoria_id = c.id
    ORDER BY c.nombre ASC, r.orden ASC, r.id ASC
  `;

  const grouped = new Map<number, RepuestoAgrupado>();

  for (const row of rows) {
    const existing = grouped.get(row.categoria_id);

    if (existing) {
      if (row.repuesto_id !== null) {
        existing.repuestos.push({
          id: row.repuesto_id,
          nombre: row.repuesto_nombre!,
          precio: Number(row.repuesto_precio),
          stockHabilitado: row.stock_habilitado ?? false,
          stockCantidad: Number(row.stock_cantidad ?? 0),
          precioStock: Number(row.precio_stock ?? 0),
        });
      }
      continue;
    }

    grouped.set(row.categoria_id, {
      categoriaId: row.categoria_id,
      categoriaNombre: row.categoria_nombre,
      repuestos:
        row.repuesto_id !== null
          ? [
              {
                id: row.repuesto_id,
                nombre: row.repuesto_nombre!,
                precio: Number(row.repuesto_precio),
                stockHabilitado: row.stock_habilitado ?? false,
                stockCantidad: Number(row.stock_cantidad ?? 0),
                precioStock: Number(row.precio_stock ?? 0),
              },
            ]
          : [],
    });
  }

  return Array.from(grouped.values());
}

export async function createCategoriaRepuesto(nombre: string) {
  const rows = await templateRows<{ id: number }>`
    INSERT INTO categorias_repuesto (nombre) VALUES (${nombre}) RETURNING id
  `;
  return rows[0];
}

export async function renameCategoriaRepuesto(id: number, nombre: string) {
  await templateRows`
    UPDATE categorias_repuesto SET nombre = ${nombre} WHERE id = ${id}
  `;
}

export async function deleteCategoriaRepuesto(id: number) {
  await templateRows`DELETE FROM repuestos WHERE categoria_id = ${id}`;
  await templateRows`DELETE FROM categorias_repuesto WHERE id = ${id}`;
}

export async function createRepuesto(categoriaId: number, nombre: string) {
  const rows = await templateRows<{ id: number }>`
    INSERT INTO repuestos (categoria_id, nombre, precio, orden)
    VALUES (
      ${categoriaId},
      ${nombre},
      0,
      COALESCE((SELECT MAX(orden) + 1 FROM repuestos WHERE categoria_id = ${categoriaId}), 1)
    )
    RETURNING id
  `;
  return rows[0];
}

export async function updateRepuestoNombres(updates: Array<{ id: number; nombre: string }>) {
  for (const { id, nombre } of updates) {
    await templateRows`UPDATE repuestos SET nombre = ${nombre} WHERE id = ${id}`;
  }
}

export async function updateRepuestoPrecios(updates: Array<{ id: number; precio: number }>) {
  if (updates.length === 0) return;

  const valuesSql = updates
    .map((u) => `(${u.id}::integer, ${u.precio}::numeric)`)
    .join(", ");

  await queryRows(`
    UPDATE repuestos AS r
    SET precio = v.precio
    FROM (VALUES ${valuesSql}) AS v(id, precio)
    WHERE r.id = v.id
  `);
}

export async function reorderRepuestos(orderedIds: number[]) {
  if (orderedIds.length === 0) return;

  const valuesSql = orderedIds
    .map((id, index) => `(${id}::integer, ${index + 1}::integer)`)
    .join(", ");

  await queryRows(`
    UPDATE repuestos AS r
    SET orden = v.orden
    FROM (VALUES ${valuesSql}) AS v(id, orden)
    WHERE r.id = v.id
  `);
}

export async function updateRepuestoStock(
  updates: Array<{ id: number; stockHabilitado: boolean; stockCantidad: number; precioStock: number }>
) {
  for (const { id, stockHabilitado, stockCantidad, precioStock } of updates) {
    await templateRows`
      UPDATE repuestos
      SET stock_habilitado = ${stockHabilitado},
          stock_cantidad = ${stockCantidad},
          precio_stock = ${precioStock}
      WHERE id = ${id}
    `;
  }
}

export async function deleteRepuesto(id: number) {
  await templateRows`DELETE FROM repuestos WHERE id = ${id}`;
}

export async function getRepuestosDetalleByTrabajo(trabajoId: number) {
  const rows = await queryRows<{
    categoria_id: number | null;
    categoria_nombre: string;
    repuesto_id: number | null;
    repuesto_nombre: string;
    precio_unitario: number;
    cantidad: number;
    precio_stock: number;
    cantidad_stock: number;
  }>(
    `
      SELECT
        r.categoria_id AS categoria_id,
        COALESCE(pr.categoria_nombre_snapshot, c.nombre) AS categoria_nombre,
        pr.repuesto_id AS repuesto_id,
        COALESCE(pr.repuesto_nombre_snapshot, r.nombre) AS repuesto_nombre,
        pr.precio AS precio_unitario,
        pr.cantidad AS cantidad,
        COALESCE(pr.precio_stock, 0) AS precio_stock,
        COALESCE(pr.cantidad_stock, 0) AS cantidad_stock
      FROM orden_trabajo_repuestos pr
      LEFT JOIN repuestos r ON r.id = pr.repuesto_id
      LEFT JOIN categorias_repuesto c ON c.id = r.categoria_id
      WHERE pr.orden_trabajo_id = $1
      ORDER BY COALESCE(pr.categoria_nombre_snapshot, c.nombre) ASC, COALESCE(pr.repuesto_nombre_snapshot, r.nombre) ASC
    `,
    [trabajoId]
  );

  return rows.map((row) => {
    const precioUnitario = Number(row.precio_unitario);
    const cantidad = Number(row.cantidad);
    const precioStock = Number(row.precio_stock);
    const cantidadStock = Number(row.cantidad_stock);
    const cantidadProveedor = Math.max(0, cantidad - cantidadStock);
    const total = precioStock * cantidadStock + precioUnitario * cantidadProveedor;

    return {
      categoriaId: row.categoria_id,
      categoriaNombre: row.categoria_nombre,
      repuestoId: row.repuesto_id,
      repuestoNombre: row.repuesto_nombre,
      precioUnitario,
      cantidad,
      precioStock,
      cantidadStock,
      total,
    };
  });
}
