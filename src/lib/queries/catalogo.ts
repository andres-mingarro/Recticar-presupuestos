import {
  queryRows,
  queryRowsFromTechnical,
  templateRows,
  templateRowsFromTechnical,
} from "@/lib/db";
import type {
  Marca,
  Modelo,
  ModeloMotorRelation,
  Motor,
  TrabajoAgrupado,
} from "@/lib/types";

export async function listMarcas() {
  return templateRowsFromTechnical<Marca>`
    SELECT id, nombre
    FROM marcas
    ORDER BY nombre ASC
  `;
}

export async function listModelosByMarca(marcaId: number) {
  return templateRowsFromTechnical<Modelo>`
    SELECT id, nombre, marca_id
    FROM modelos
    WHERE marca_id = ${marcaId}
    ORDER BY nombre ASC
  `;
}

export async function listModelos() {
  return templateRowsFromTechnical<Modelo>`
    SELECT id, nombre, marca_id
    FROM modelos
    ORDER BY nombre ASC
  `;
}

export async function listMotoresByModelo(modeloId: number) {
  return templateRowsFromTechnical<Motor>`
    SELECT DISTINCT m.id, m.nombre
    FROM vehiculos v
    INNER JOIN motores m ON m.id = v.motor_id
    WHERE v.modelo_id = ${modeloId}
    ORDER BY m.nombre ASC
  `;
}

export async function listMotores() {
  return templateRowsFromTechnical<Motor>`
    SELECT id, nombre
    FROM motores
    ORDER BY nombre ASC
  `;
}

export async function listModeloMotorRelations() {
  return templateRowsFromTechnical<ModeloMotorRelation>`
    SELECT DISTINCT modelo_id, motor_id
    FROM vehiculos
  `;
}

type TechnicalRef = {
  marca_id: number | null;
  modelo_id: number | null;
  motor_id: number | null;
};

export async function hydrateTechnicalLabels<T extends TechnicalRef>(items: T[]) {
  if (items.length === 0) {
    return [] as Array<
      T & {
        marca_nombre: string | null;
        modelo_nombre: string | null;
        motor_nombre: string | null;
      }
    >;
  }

  const [marcas, modelos, motores] = await Promise.all([
    listMarcas(),
    listModelos(),
    listMotores(),
  ]);

  const marcasById = new Map(marcas.map((marca) => [marca.id, marca.nombre]));
  const modelosById = new Map(modelos.map((modelo) => [modelo.id, modelo.nombre]));
  const motoresById = new Map(motores.map((motor) => [motor.id, motor.nombre]));

  return items.map((item) => ({
    ...item,
    marca_nombre: item.marca_id ? marcasById.get(item.marca_id) ?? null : null,
    modelo_nombre: item.modelo_id ? modelosById.get(item.modelo_id) ?? null : null,
    motor_nombre: item.motor_id ? motoresById.get(item.motor_id) ?? null : null,
  }));
}

export async function listTechnicalCombinations(limit?: number) {
  const rows = await queryRowsFromTechnical<{
    marca_id: number;
    marca_nombre: string;
    modelo_id: number;
    modelo_nombre: string;
    motor_id: number;
    motor_nombre: string;
  }>(
    `
      SELECT
        ma.id AS marca_id,
        ma.nombre AS marca_nombre,
        mo.id AS modelo_id,
        mo.nombre AS modelo_nombre,
        m.id AS motor_id,
        m.nombre AS motor_nombre
      FROM vehiculos v
      INNER JOIN modelos mo ON mo.id = v.modelo_id
      INNER JOIN marcas ma ON ma.id = mo.marca_id
      INNER JOIN motores m ON m.id = v.motor_id
      ORDER BY ma.nombre ASC, mo.nombre ASC, m.nombre ASC
      ${limit ? `LIMIT ${limit}` : ""}
    `
  );

  return rows;
}

export async function listTrabajosAgrupados() {
  const rows = await templateRows<{
    categoria_id: number;
    categoria_nombre: string;
    trabajo_id: number | null;
    trabajo_nombre: string | null;
    trabajo_precio: number | null;
    trabajo_precio_lista_1: number | null;
    trabajo_precio_lista_2: number | null;
    trabajo_precio_lista_3: number | null;
  }>`
    SELECT
      c.id AS categoria_id,
      c.nombre AS categoria_nombre,
      t.id AS trabajo_id,
      t.nombre AS trabajo_nombre,
      t.precio AS trabajo_precio,
      t.precio_lista_1 AS trabajo_precio_lista_1,
      t.precio_lista_2 AS trabajo_precio_lista_2,
      t.precio_lista_3 AS trabajo_precio_lista_3
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
          precioLista1: Number(row.trabajo_precio_lista_1),
          precioLista2: Number(row.trabajo_precio_lista_2),
          precioLista3: Number(row.trabajo_precio_lista_3),
        });
      }
      continue;
    }

    grouped.set(row.categoria_id, {
      categoriaId: row.categoria_id,
      categoriaNombre: row.categoria_nombre,
      trabajos:
        row.trabajo_id !== null
          ? [{
              id: row.trabajo_id,
              nombre: row.trabajo_nombre!,
              precio: Number(row.trabajo_precio),
              precioLista1: Number(row.trabajo_precio_lista_1),
              precioLista2: Number(row.trabajo_precio_lista_2),
              precioLista3: Number(row.trabajo_precio_lista_3),
            }]
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
  // Check if any trabajo in this category is used in trabajos
  const used = await templateRows<{ count: number }>`
    SELECT COUNT(*)::int AS count
    FROM orden_trabajo_trabajos pt
    INNER JOIN trabajos t ON t.id = pt.trabajo_id
    WHERE t.categoria_id = ${id}
  `;
  if (used[0].count > 0) {
    throw new Error(
      "No se puede eliminar la categoría porque tiene trabajos usados en trabajos."
    );
  }
  await templateRows`DELETE FROM trabajos WHERE categoria_id = ${id}`;
  await templateRows`DELETE FROM categorias_trabajo WHERE id = ${id}`;
}

export async function createTrabajo(categoriaId: number, nombre: string) {
  const rows = await templateRows<{ id: number }>`
    INSERT INTO trabajos (
      categoria_id,
      nombre,
      precio,
      precio_lista_1,
      precio_lista_2,
      precio_lista_3,
      orden
    )
    VALUES (
      ${categoriaId},
      ${nombre},
      0,
      0,
      0,
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
    SELECT COUNT(*)::int AS count FROM orden_trabajo_trabajos WHERE trabajo_id = ${id}
  `;
  if (used[0].count > 0) {
    throw new Error(
      "No se puede eliminar el trabajo porque está usado en trabajos."
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

export async function getTrabajosDetalleByTrabajo(trabajoId: number, listaPrecios: 1 | 2 | 3 = 1) {
  const precioCol = listaPrecios === 3 ? "t.precio_lista_3" : listaPrecios === 2 ? "t.precio_lista_2" : "t.precio_lista_1";

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
        ${precioCol} AS precio
      FROM orden_trabajo_trabajos pt
      INNER JOIN trabajos t ON t.id = pt.trabajo_id
      INNER JOIN categorias_trabajo c ON c.id = t.categoria_id
      WHERE pt.orden_trabajo_id = $1
      ORDER BY c.nombre ASC, t.nombre ASC
    `,
    [trabajoId]
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
  updates: Array<{
    id: number;
    precioLista1: number;
    precioLista2: number;
    precioLista3: number;
  }>
) {
  if (updates.length === 0) return;

  const valuesSql = updates
    .map(
      (u) =>
        `(${u.id}::integer, ${u.precioLista1}::numeric, ${u.precioLista2}::numeric, ${u.precioLista3}::numeric)`
    )
    .join(", ");

  await queryRows(`
    UPDATE trabajos AS t
    SET
      precio = v.precio_lista_1,
      precio_lista_1 = v.precio_lista_1,
      precio_lista_2 = v.precio_lista_2,
      precio_lista_3 = v.precio_lista_3
    FROM (VALUES ${valuesSql}) AS v(id, precio_lista_1, precio_lista_2, precio_lista_3)
    WHERE t.id = v.id
  `);
}
