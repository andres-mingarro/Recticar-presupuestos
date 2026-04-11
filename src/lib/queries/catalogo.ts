import { queryRows, templateRows } from "@/lib/db";
import type {
  Marca,
  Modelo,
  ModeloMotorRelation,
  Motor,
  TrabajoAgrupado,
} from "@/lib/types";

export async function listMarcas() {
  return templateRows<Marca>`
    SELECT id, nombre
    FROM marcas
    ORDER BY nombre ASC
  `;
}

export async function listModelosByMarca(marcaId: number) {
  return templateRows<Modelo>`
    SELECT id, nombre, marca_id
    FROM modelos
    WHERE marca_id = ${marcaId}
    ORDER BY nombre ASC
  `;
}

export async function listModelos() {
  return templateRows<Modelo>`
    SELECT id, nombre, marca_id
    FROM modelos
    ORDER BY nombre ASC
  `;
}

export async function listMotoresByModelo(modeloId: number) {
  return templateRows<Motor>`
    SELECT m.id, m.nombre
    FROM motores m
    INNER JOIN modelo_motor mm ON mm.motor_id = m.id
    WHERE mm.modelo_id = ${modeloId}
    ORDER BY m.nombre ASC
  `;
}

export async function listMotores() {
  return templateRows<Motor>`
    SELECT id, nombre
    FROM motores
    ORDER BY nombre ASC
  `;
}

export async function listModeloMotorRelations() {
  return templateRows<ModeloMotorRelation>`
    SELECT modelo_id, motor_id
    FROM modelo_motor
  `;
}

export async function listTrabajosAgrupados() {
  const rows = await templateRows<{
    categoria_id: number;
    categoria_nombre: string;
    trabajo_id: number | null;
    trabajo_nombre: string | null;
    trabajo_precio: number | null;
  }>`
    SELECT
      c.id AS categoria_id,
      c.nombre AS categoria_nombre,
      t.id AS trabajo_id,
      t.nombre AS trabajo_nombre,
      t.precio AS trabajo_precio
    FROM categorias_trabajo c
    LEFT JOIN trabajos t ON t.categoria_id = c.id
    ORDER BY c.nombre ASC, t.orden ASC, t.id ASC
  `;

  const grouped = new Map<number, TrabajoAgrupado>();

  for (const row of rows) {
    const existing = grouped.get(row.categoria_id);

    if (existing) {
      if (row.trabajo_id !== null) {
        existing.trabajos.push({
          id: row.trabajo_id,
          nombre: row.trabajo_nombre!,
          precio: Number(row.trabajo_precio),
        });
      }
      continue;
    }

    grouped.set(row.categoria_id, {
      categoriaId: row.categoria_id,
      categoriaNombre: row.categoria_nombre,
      trabajos:
        row.trabajo_id !== null
          ? [{ id: row.trabajo_id, nombre: row.trabajo_nombre!, precio: Number(row.trabajo_precio) }]
          : [],
    });
  }

  return Array.from(grouped.values());
}

export async function createCategoria(nombre: string) {
  const rows = await templateRows<{ id: number }>`
    INSERT INTO categorias_trabajo (nombre) VALUES (${nombre}) RETURNING id
  `;
  return rows[0];
}

export async function renameCategoria(id: number, nombre: string) {
  await templateRows`
    UPDATE categorias_trabajo SET nombre = ${nombre} WHERE id = ${id}
  `;
}

export async function deleteCategoria(id: number) {
  // Check if any trabajo in this category is used in pedidos
  const used = await templateRows<{ count: number }>`
    SELECT COUNT(*)::int AS count
    FROM pedido_trabajos pt
    INNER JOIN trabajos t ON t.id = pt.trabajo_id
    WHERE t.categoria_id = ${id}
  `;
  if (used[0].count > 0) {
    throw new Error(
      "No se puede eliminar la categoría porque tiene trabajos usados en pedidos."
    );
  }
  await templateRows`DELETE FROM trabajos WHERE categoria_id = ${id}`;
  await templateRows`DELETE FROM categorias_trabajo WHERE id = ${id}`;
}

export async function createTrabajo(categoriaId: number, nombre: string) {
  const rows = await templateRows<{ id: number }>`
    INSERT INTO trabajos (categoria_id, nombre, precio, orden)
    VALUES (
      ${categoriaId},
      ${nombre},
      0,
      COALESCE((SELECT MAX(orden) + 1 FROM trabajos WHERE categoria_id = ${categoriaId}), 1)
    )
    RETURNING id
  `;
  return rows[0];
}

export async function updateTrabajoNombres(updates: Array<{ id: number; nombre: string }>) {
  for (const { id, nombre } of updates) {
    await templateRows`UPDATE trabajos SET nombre = ${nombre} WHERE id = ${id}`;
  }
}

export async function reorderTrabajos(orderedIds: number[]) {
  if (orderedIds.length === 0) return;

  const valuesSql = orderedIds
    .map((id, index) => `(${id}::integer, ${index + 1}::integer)`)
    .join(", ");

  await queryRows(`
    UPDATE trabajos AS t
    SET orden = v.orden
    FROM (VALUES ${valuesSql}) AS v(id, orden)
    WHERE t.id = v.id
  `);
}

export async function deleteTrabajo(id: number) {
  const used = await templateRows<{ count: number }>`
    SELECT COUNT(*)::int AS count FROM pedido_trabajos WHERE trabajo_id = ${id}
  `;
  if (used[0].count > 0) {
    throw new Error(
      "No se puede eliminar el trabajo porque está usado en pedidos."
    );
  }
  await templateRows`DELETE FROM trabajos WHERE id = ${id}`;
}

export type TrabajoDetalleItem = {
  categoriaId: number;
  categoriaNombre: string;
  trabajoId: number;
  trabajoNombre: string;
  precio: number;
};

export async function getTrabajosDetalleByPedido(pedidoId: number) {
  const rows = await queryRows<{
    categoria_id: number;
    categoria_nombre: string;
    trabajo_id: number;
    trabajo_nombre: string;
    precio: number;
  }>(
    `
      SELECT
        c.id AS categoria_id,
        c.nombre AS categoria_nombre,
        t.id AS trabajo_id,
        t.nombre AS trabajo_nombre,
        t.precio
      FROM pedido_trabajos pt
      INNER JOIN trabajos t ON t.id = pt.trabajo_id
      INNER JOIN categorias_trabajo c ON c.id = t.categoria_id
      WHERE pt.pedido_id = $1
      ORDER BY c.nombre ASC, t.nombre ASC
    `,
    [pedidoId]
  );

  return rows.map((row) => ({
    categoriaId: row.categoria_id,
    categoriaNombre: row.categoria_nombre,
    trabajoId: row.trabajo_id,
    trabajoNombre: row.trabajo_nombre,
    precio: Number(row.precio),
  }));
}

export async function updateTrabajoPrecios(
  updates: Array<{ id: number; precio: number }>
) {
  if (updates.length === 0) return;

  const valuesSql = updates
    .map((u) => `(${u.id}::integer, ${u.precio}::numeric)`)
    .join(", ");

  await queryRows(`
    UPDATE trabajos AS t
    SET precio = v.precio
    FROM (VALUES ${valuesSql}) AS v(id, precio)
    WHERE t.id = v.id
  `);
}
