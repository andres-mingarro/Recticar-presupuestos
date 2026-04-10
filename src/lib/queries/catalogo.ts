import { templateRows } from "@/lib/db";
import type { Marca, Modelo, Motor, TrabajoAgrupado } from "@/lib/types";

export async function listMarcas() {
  return templateRows<Marca>`
    SELECT id, nombre
    FROM marcas
    ORDER BY nombre ASC
  `;
}

export async function listModelosByMarca(marcaId: number) {
  return templateRows<Modelo>`
    SELECT id, nombre
    FROM modelos
    WHERE marca_id = ${marcaId}
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

export async function listTrabajosAgrupados() {
  const rows = await templateRows<{
    categoria_id: number;
    categoria_nombre: string;
    trabajo_id: number;
    trabajo_nombre: string;
  }>`
    SELECT
      c.id AS categoria_id,
      c.nombre AS categoria_nombre,
      t.id AS trabajo_id,
      t.nombre AS trabajo_nombre
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
        },
      ],
    });
  }

  return Array.from(grouped.values());
}
