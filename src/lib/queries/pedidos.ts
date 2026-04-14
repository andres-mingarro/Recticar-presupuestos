import { queryRows, templateRows } from "@/lib/db";
import { hydrateTechnicalLabels, listMarcas, listModelos, listMotores } from "@/lib/queries/catalogo";
import type {
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

type PedidoListRow = Omit<
  PedidoListItem,
  "marca_nombre" | "modelo_nombre" | "motor_nombre"
>;

type PedidoDetailRow = Omit<
  PedidoDetail,
  "trabajos_ids" | "repuestos_ids" | "marca_nombre" | "modelo_nombre" | "motor_nombre"
> & {
  trabajos_ids: number[] | null;
  repuestos_ids: number[] | null;
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

  const [rows, [marcas, modelos, motores]] = await Promise.all([
    queryRows<PedidoListRow>(
      `
        SELECT
          p.id,
          p.numero_pedido,
          p.cobrado,
          p.estado,
          p.prioridad,
          p.fecha_creacion,
          p.fecha_aprobacion,
          p.cliente_id,
          p.marca_id,
          p.modelo_id,
          p.motor_id,
          CASE
            WHEN c.id IS NULL THEN NULL
            ELSE concat(c.apellido, ', ', c.nombre)
          END AS cliente_nombre,
          p.numero_serie_motor
        FROM pedidos p
        LEFT JOIN clientes c ON c.id = p.cliente_id
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
    ),
    Promise.all([listMarcas(), listModelos(), listMotores()]),
  ]);

  if (rows.length === 0) return [] as PedidoListItem[];

  const marcasById = new Map(marcas.map((m) => [m.id, m.nombre]));
  const modelosById = new Map(modelos.map((m) => [m.id, m.nombre]));
  const motoresById = new Map(motores.map((m) => [m.id, m.nombre]));

  return rows.map((item) => ({
    ...item,
    marca_nombre: item.marca_id ? (marcasById.get(item.marca_id) ?? null) : null,
    modelo_nombre: item.modelo_id ? (modelosById.get(item.modelo_id) ?? null) : null,
    motor_nombre: item.motor_id ? (motoresById.get(item.motor_id) ?? null) : null,
  }));
}

export async function getPedidoById(id: number) {
  const rows = await queryRows<PedidoListRow>(
    `
      SELECT
        p.id,
        p.numero_pedido,
        p.cobrado,
        p.estado,
        p.prioridad,
        p.fecha_creacion,
        p.fecha_aprobacion,
        p.cliente_id,
        p.marca_id,
        p.modelo_id,
        p.motor_id,
        CASE
          WHEN c.id IS NULL THEN NULL
          ELSE concat(c.apellido, ', ', c.nombre)
        END AS cliente_nombre,
        p.numero_serie_motor
      FROM pedidos p
      LEFT JOIN clientes c ON c.id = p.cliente_id
      WHERE p.id = $1
      LIMIT 1
    `,
    [id]
  );

  const hydrated = await hydrateTechnicalLabels(rows);
  return hydrated[0] ?? null;
}

export async function getPedidoDetailById(id: number): Promise<PedidoDetail | null> {
  const rows = await queryRows<PedidoDetailRow>(
    `
      SELECT
        p.id,
        p.numero_pedido,
        p.cobrado,
        p.estado,
        p.prioridad,
        p.fecha_creacion,
        p.fecha_aprobacion,
        p.cliente_id,
        p.marca_id,
        p.modelo_id,
        p.motor_id,
        CASE
          WHEN c.id IS NULL THEN NULL
          ELSE concat(c.apellido, ', ', c.nombre)
        END AS cliente_nombre,
        c.dni AS cliente_dni,
        c.cuit AS cliente_cuit,
        c.telefono AS cliente_telefono,
        p.numero_serie_motor,
        p.observaciones,
        p.lista_precio,
        (
          SELECT array_agg(pt.trabajo_id ORDER BY pt.trabajo_id)
          FROM pedido_trabajos pt
          WHERE pt.pedido_id = p.id
        ) AS trabajos_ids,
        (
          SELECT array_agg(pr.repuesto_id ORDER BY pr.repuesto_id)
          FROM pedido_repuestos pr
          WHERE pr.pedido_id = p.id
        ) AS repuestos_ids
      FROM pedidos p
      LEFT JOIN clientes c ON c.id = p.cliente_id
      WHERE p.id = $1
      LIMIT 1
    `,
    [id]
  );

  const row = rows[0];
  if (!row) return null;

  const hydrated = await hydrateTechnicalLabels([
    {
      ...row,
      trabajos_ids: row.trabajos_ids ?? [],
      repuestos_ids: row.repuestos_ids ?? [],
    },
  ]);
  return hydrated[0] ?? null;
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
      cobrado        = ${input.cobrado},
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
  await queryRows(`DELETE FROM pedido_repuestos WHERE pedido_id = $1`, [id]);

  if (input.trabajosIds.length > 0) {
    const valuesSql = input.trabajosIds
      .map((trabajoId) => `(${id}, ${Number(trabajoId)})`)
      .join(", ");

    await queryRows(
      `INSERT INTO pedido_trabajos (pedido_id, trabajo_id) VALUES ${valuesSql} ON CONFLICT DO NOTHING`
    );
  }

  if (input.repuestosIds.length > 0) {
    const valuesSql = input.repuestosIds
      .map((repuestoId) => `(${id}, ${Number(repuestoId)})`)
      .join(", ");

    await queryRows(
      `INSERT INTO pedido_repuestos (pedido_id, repuesto_id) VALUES ${valuesSql} ON CONFLICT DO NOTHING`
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
      cobrado,
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
      ${input.cobrado},
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

  if (input.repuestosIds.length > 0) {
    const valuesSql = input.repuestosIds
      .map((repuestoId) => `(${pedidoId}, ${Number(repuestoId)})`)
      .join(", ");

    await queryRows(
      `
        INSERT INTO pedido_repuestos (pedido_id, repuesto_id)
        VALUES ${valuesSql}
        ON CONFLICT (pedido_id, repuesto_id) DO NOTHING
      `
    );
  }

  return pedidoId;
}

export async function listPedidosByCliente(clienteId: number) {
  const rows = await queryRows<PedidoListRow>(
    `
      SELECT
        p.id,
        p.numero_pedido,
        p.cobrado,
        p.estado,
        p.prioridad,
        p.fecha_creacion,
        p.fecha_aprobacion,
        p.cliente_id,
        p.marca_id,
        p.modelo_id,
        p.motor_id,
        CASE
          WHEN c.id IS NULL THEN NULL
          ELSE concat(c.apellido, ', ', c.nombre)
        END AS cliente_nombre,
        p.numero_serie_motor
      FROM pedidos p
      LEFT JOIN clientes c ON c.id = p.cliente_id
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

  return hydrateTechnicalLabels(rows);
}
