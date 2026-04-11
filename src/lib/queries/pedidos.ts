import { queryRows, templateRows } from "@/lib/db";
import type {
  ClientePedidoItem,
  PedidoDetail,
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
      ORDER BY
        CASE
          WHEN p.prioridad = 'alta' THEN 1
          WHEN p.prioridad = 'normal' THEN 2
          ELSE 3
        END,
        p.fecha_creacion ASC,
        p.numero_pedido ASC
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

export async function getPedidoDetailById(id: number): Promise<PedidoDetail | null> {
  type Row = Omit<PedidoDetail, "trabajos_ids"> & { trabajos_ids: number[] | null };

  const rows = await queryRows<Row>(
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
        p.numero_serie_motor,
        p.observaciones,
        p.lista_precio,
        array_agg(pt.trabajo_id ORDER BY pt.trabajo_id)
          FILTER (WHERE pt.trabajo_id IS NOT NULL) AS trabajos_ids
      FROM pedidos p
      LEFT JOIN clientes c ON c.id = p.cliente_id
      LEFT JOIN marcas ma ON ma.id = p.marca_id
      LEFT JOIN modelos mo ON mo.id = p.modelo_id
      LEFT JOIN motores mt ON mt.id = p.motor_id
      LEFT JOIN pedido_trabajos pt ON pt.pedido_id = p.id
      WHERE p.id = $1
      GROUP BY p.id, c.id, ma.id, mo.id, mt.id
      LIMIT 1
    `,
    [id]
  );

  const row = rows[0];
  if (!row) return null;

  return { ...row, trabajos_ids: row.trabajos_ids ?? [] };
}

export async function updatePedido(id: number, input: PedidoFormValues) {
  const clienteId = input.clienteId ? Number(input.clienteId) : null;
  const marcaId = input.marcaId ? Number(input.marcaId) : null;
  const modeloId = input.modeloId ? Number(input.modeloId) : null;
  const motorId = input.motorId ? Number(input.motorId) : null;

  const updated = await templateRows<{ id: number }>`
    UPDATE pedidos SET
      cliente_id     = ${clienteId},
      marca_id       = ${marcaId},
      modelo_id      = ${modeloId},
      motor_id       = ${motorId},
      numero_serie_motor = ${input.numeroSerieMotor},
      prioridad      = ${input.prioridad},
      estado         = ${input.estado}::pedido_estado,
      lista_precio   = ${input.listaPrecios},
      fecha_aprobacion = CASE
        WHEN ${input.estado}::text = 'aprobado' AND fecha_aprobacion IS NULL THEN now()
        ELSE fecha_aprobacion
      END,
      observaciones  = ${input.observaciones || null}
    WHERE id = ${id}
    RETURNING id
  `;

  if (!updated[0]?.id) return false;

  await queryRows(`DELETE FROM pedido_trabajos WHERE pedido_id = $1`, [id]);

  if (input.trabajosIds.length > 0) {
    const valuesSql = input.trabajosIds
      .map((trabajoId) => `(${id}, ${Number(trabajoId)})`)
      .join(", ");

    await queryRows(
      `INSERT INTO pedido_trabajos (pedido_id, trabajo_id) VALUES ${valuesSql} ON CONFLICT DO NOTHING`
    );
  }

  return true;
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
      observaciones,
      lista_precio
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
      ${input.observaciones || null},
      ${input.listaPrecios}
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
