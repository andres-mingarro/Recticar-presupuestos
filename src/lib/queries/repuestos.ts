import { queryRows, templateRows } from "@/lib/db";
import type { RepuestoAgrupado } from "@/lib/types";

export type RepuestoDetalleItem = {
  categoriaId: number;
  categoriaNombre: string;
  repuestoId: number;
  repuestoNombre: string;
  precio: number;
};

export async function listRepuestosAgrupados() {
  const rows = await templateRows<{
    categoria_id: number;
    categoria_nombre: string;
    repuesto_id: number | null;
    repuesto_nombre: string | null;
    repuesto_precio: number | null;
  }>`
    SELECT
      c.id AS categoria_id,
      c.nombre AS categoria_nombre,
      r.id AS repuesto_id,
      r.nombre AS repuesto_nombre,
      r.precio AS repuesto_precio
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

export async function deleteRepuesto(id: number) {
  await templateRows`DELETE FROM repuestos WHERE id = ${id}`;
}

export async function getRepuestosDetalleByPedido(pedidoId: number) {
  const rows = await queryRows<{
    categoria_id: number;
    categoria_nombre: string;
    repuesto_id: number;
    repuesto_nombre: string;
    precio: number;
  }>(
    `
      SELECT
        c.id AS categoria_id,
        c.nombre AS categoria_nombre,
        r.id AS repuesto_id,
        r.nombre AS repuesto_nombre,
        r.precio AS precio
      FROM pedido_repuestos pr
      INNER JOIN repuestos r ON r.id = pr.repuesto_id
      INNER JOIN categorias_repuesto c ON c.id = r.categoria_id
      WHERE pr.pedido_id = $1
      ORDER BY c.nombre ASC, r.nombre ASC
    `,
    [pedidoId]
  );

  return rows.map((row) => ({
    categoriaId: row.categoria_id,
    categoriaNombre: row.categoria_nombre,
    repuestoId: row.repuesto_id,
    repuestoNombre: row.repuesto_nombre,
    precio: Number(row.precio),
  }));
}
