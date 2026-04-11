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
    trabajo_id: number;
    trabajo_nombre: string;
    trabajo_precio: number;
  }>`
    SELECT
      c.id AS categoria_id,
      c.nombre AS categoria_nombre,
      t.id AS trabajo_id,
      t.nombre AS trabajo_nombre,
      t.precio AS trabajo_precio
    FROM categorias_trabajo c
    INNER JOIN trabajos t ON t.categoria_id = c.id
    ORDER BY c.nombre ASC, t.nombre ASC
  `;

  const grouped = new Map<number, TrabajoAgrupado>();

  for (const row of rows) {
    const category = grouped.get(row.categoria_id);

    if (category) {
      category.trabajos.push({
        id: row.trabajo_id,
        nombre: row.trabajo_nombre,
        precio: Number(row.trabajo_precio),
      });
      continue;
    }

    grouped.set(row.categoria_id, {
      categoriaId: row.categoria_id,
      categoriaNombre: row.categoria_nombre,
      trabajos: [
        {
          id: row.trabajo_id,
          nombre: row.trabajo_nombre,
          precio: Number(row.trabajo_precio),
        },
      ],
    });
  }

  return Array.from(grouped.values());
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
