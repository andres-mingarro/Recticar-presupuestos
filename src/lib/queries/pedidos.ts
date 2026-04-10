import { queryRows } from "@/lib/db";
import type { PedidoEstado, PedidoListItem, PedidoPrioridad } from "@/lib/types";

type PedidoFilters = {
  estado?: PedidoEstado;
  prioridad?: PedidoPrioridad;
};

export async function listPedidos(filters: PedidoFilters = {}) {
  const conditions: string[] = [];
  const params: Array<string> = [];

  if (filters.estado) {
    params.push(filters.estado);
    conditions.push(`p.estado = $${params.length}`);
  }

  if (filters.prioridad) {
    params.push(filters.prioridad);
    conditions.push(`p.prioridad = $${params.length}`);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  return queryRows<PedidoListItem>(
    `
      SELECT
        p.id,
        p.numero_pedido,
        p.estado,
        p.prioridad,
        p.fecha_creacion,
        p.fecha_aprobacion,
        p.cliente_id,
        CASE
          WHEN c.id IS NULL THEN NULL
          ELSE concat(c.apellido, ', ', c.nombre)
        END AS cliente_nombre,
        ma.nombre AS marca_nombre,
        mo.nombre AS modelo_nombre,
        mt.nombre AS motor_nombre,
        p.numero_serie_motor
      FROM pedidos p
      LEFT JOIN clientes c ON c.id = p.cliente_id
      LEFT JOIN marcas ma ON ma.id = p.marca_id
      LEFT JOIN modelos mo ON mo.id = p.modelo_id
      LEFT JOIN motores mt ON mt.id = p.motor_id
      ${whereClause}
      ORDER BY p.numero_pedido DESC
    `,
    params
  );
}

export async function getPedidoById(id: number) {
  const rows = await queryRows<PedidoListItem>(
    `
      SELECT
        p.id,
        p.numero_pedido,
        p.estado,
        p.prioridad,
        p.fecha_creacion,
        p.fecha_aprobacion,
        p.cliente_id,
        CASE
          WHEN c.id IS NULL THEN NULL
          ELSE concat(c.apellido, ', ', c.nombre)
        END AS cliente_nombre,
        ma.nombre AS marca_nombre,
        mo.nombre AS modelo_nombre,
        mt.nombre AS motor_nombre,
        p.numero_serie_motor
      FROM pedidos p
      LEFT JOIN clientes c ON c.id = p.cliente_id
      LEFT JOIN marcas ma ON ma.id = p.marca_id
      LEFT JOIN modelos mo ON mo.id = p.modelo_id
      LEFT JOIN motores mt ON mt.id = p.motor_id
      WHERE p.id = $1
      LIMIT 1
    `,
    [id]
  );

  return rows[0] ?? null;
}
