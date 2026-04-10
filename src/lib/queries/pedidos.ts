import { queryRows, templateRows } from "@/lib/db";
import type {
  ClientePedidoItem,
  PedidoEstado,
  PedidoFormValues,
  PedidoListItem,
  PedidoPrioridad,
} from "@/lib/types";

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

export async function createPedido(input: PedidoFormValues) {
  const clienteId = input.clienteId ? Number(input.clienteId) : null;
  const marcaId = input.marcaId ? Number(input.marcaId) : null;
  const modeloId = input.modeloId ? Number(input.modeloId) : null;
  const motorId = input.motorId ? Number(input.motorId) : null;
  const fechaAprobacion =
    input.estado === "aprobado" ? new Date().toISOString() : null;

  const insertedPedido = await templateRows<{ id: number }>`
    INSERT INTO pedidos (
      cliente_id,
      marca_id,
      modelo_id,
      motor_id,
      numero_serie_motor,
      prioridad,
      estado,
      fecha_aprobacion,
      observaciones
    )
    VALUES (
      ${clienteId},
      ${marcaId},
      ${modeloId},
      ${motorId},
      ${input.numeroSerieMotor},
      ${input.prioridad},
      ${input.estado},
      ${fechaAprobacion},
      ${input.observaciones || null}
    )
    RETURNING id
  `;

  const pedidoId = insertedPedido[0]?.id ?? null;

  if (!pedidoId) {
    return null;
  }

  if (input.trabajosIds.length > 0) {
    const valuesSql = input.trabajosIds
      .map((trabajoId) => `(${pedidoId}, ${Number(trabajoId)})`)
      .join(", ");

    await queryRows(
      `
        INSERT INTO pedido_trabajos (pedido_id, trabajo_id)
        VALUES ${valuesSql}
        ON CONFLICT (pedido_id, trabajo_id) DO NOTHING
      `
    );
  }

  return pedidoId;
}

export async function listPedidosByCliente(clienteId: number) {
  return queryRows<ClientePedidoItem>(
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
      WHERE p.cliente_id = $1
      ORDER BY
        CASE
          WHEN p.estado = 'pendiente' THEN 1
          WHEN p.estado = 'aprobado' THEN 2
          ELSE 3
        END,
        p.numero_pedido DESC
    `,
    [clienteId]
  );
}
