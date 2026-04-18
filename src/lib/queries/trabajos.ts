import { queryRows, templateRows } from "@/lib/db";
import { hydrateTechnicalLabels, listMarcas, listModelos, listMotores } from "@/lib/queries/catalogo";
import type {
  TrabajoDetail,
  TrabajoEstado,
  TrabajoFormValues,
  TrabajoRepuestoValue,
  TrabajoListItem,
  TrabajoPrioridad,
} from "@/lib/types";

type TrabajoFilters = {
  estado?: TrabajoEstado;
  prioridad?: TrabajoPrioridad;
  numeroTrabajo?: number;
};

type TrabajoListRow = Omit<
  TrabajoListItem,
  "marca_nombre" | "modelo_nombre" | "motor_nombre"
>;

type TrabajoDetailRow = Omit<
  TrabajoDetail,
  "trabajos_ids" | "repuestos_ids" | "repuestos" | "marca_nombre" | "modelo_nombre" | "motor_nombre"
> & {
  trabajos_ids: number[] | null;
  repuestos_ids: number[] | null;
};

export async function listTrabajos(filters: TrabajoFilters = {}) {
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

  if (filters.numeroTrabajo) {
    params.push(String(filters.numeroTrabajo));
    conditions.push(`p.numero_trabajo = $${params.length}`);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const [rows, [marcas, modelos, motores]] = await Promise.all([
    queryRows<TrabajoListRow>(
      `
        SELECT
          p.id,
          p.numero_trabajo,
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
        FROM ordenes_trabajo p
        LEFT JOIN clientes c ON c.id = p.cliente_id
        ${whereClause}
        ORDER BY
          CASE
            WHEN p.prioridad = 'alta' THEN 1
            WHEN p.prioridad = 'normal' THEN 2
            ELSE 3
          END,
          p.fecha_creacion ASC,
          p.numero_trabajo ASC
      `,
      params
    ),
    Promise.all([listMarcas(), listModelos(), listMotores()]),
  ]);

  if (rows.length === 0) return [] as TrabajoListItem[];

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

export async function getTrabajoById(id: number) {
  const rows = await queryRows<TrabajoListRow>(
    `
      SELECT
        p.id,
        p.numero_trabajo,
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
      FROM ordenes_trabajo p
      LEFT JOIN clientes c ON c.id = p.cliente_id
      WHERE p.id = $1
      LIMIT 1
    `,
    [id]
  );

  const hydrated = await hydrateTechnicalLabels(rows);
  return hydrated[0] ?? null;
}

export async function getTrabajoDetailById(id: number): Promise<TrabajoDetail | null> {
  const rows = await queryRows<TrabajoDetailRow>(
    `
      SELECT
        p.id,
        p.numero_trabajo,
        p.cobrado,
        p.estado,
        p.prioridad,
        p.fecha_creacion,
        p.fecha_aprobacion,
        p.updated_at::text AS updated_at,
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
          FROM orden_trabajo_trabajos pt
          WHERE pt.orden_trabajo_id = p.id
        ) AS trabajos_ids,
        (
          SELECT array_agg(pr.repuesto_id ORDER BY pr.repuesto_id)
          FROM orden_trabajo_repuestos pr
          WHERE pr.orden_trabajo_id = p.id
        ) AS repuestos_ids
      FROM ordenes_trabajo p
      LEFT JOIN clientes c ON c.id = p.cliente_id
      WHERE p.id = $1
      LIMIT 1
    `,
    [id]
  );

  const row = rows[0];
  if (!row) return null;

  const repuestos = await queryRows<{
    repuesto_id: number;
    precio: number;
    cantidad: number;
  }>(
    `
      SELECT
        pr.repuesto_id,
        pr.precio,
        pr.cantidad
      FROM orden_trabajo_repuestos pr
      WHERE pr.orden_trabajo_id = $1
      ORDER BY pr.repuesto_id ASC
    `,
    [id]
  );

  const hydrated = await hydrateTechnicalLabels([
    {
      ...row,
      trabajos_ids: row.trabajos_ids ?? [],
      repuestos_ids: row.repuestos_ids ?? [],
      repuestos: repuestos.map((item) => ({
        repuestoId: String(item.repuesto_id),
        precioUnitario: Number(item.precio),
        cantidad: Number(item.cantidad),
      })) satisfies TrabajoRepuestoValue[],
    },
  ]);
  return hydrated[0] ?? null;
}

export async function updateTrabajo(
  id: number,
  input: TrabajoFormValues
): Promise<{ updatedAt: string } | "conflict"> {
  if (!input.updatedAt) return "conflict";

  const clienteId = input.clienteId ? Number(input.clienteId) : null;
  const marcaId = input.marcaId ? Number(input.marcaId) : null;
  const modeloId = input.modeloId ? Number(input.modeloId) : null;
  const motorId = input.motorId ? Number(input.motorId) : null;
  const trabajosIds = input.trabajosIds.map(Number);
  const repuestosIds = input.repuestos.map((r) => Number(r.repuestoId));
  const precios = input.repuestos.map((r) => r.precioUnitario);
  const cantidades = input.repuestos.map((r) => r.cantidad);

  const rows = await queryRows<{ id: number; updated_at: string }>(
    `
      WITH
        upd AS (
          UPDATE ordenes_trabajo SET
            cliente_id         = $3,
            marca_id           = $4,
            modelo_id          = $5,
            motor_id           = $6,
            numero_serie_motor = $7,
            cobrado            = $8,
            prioridad          = $9::orden_trabajo_prioridad,
            estado             = $10::orden_trabajo_estado,
            lista_precio       = $11,
            fecha_aprobacion   = CASE
              WHEN $10::text = 'aprobado' AND fecha_aprobacion IS NULL THEN now()
              ELSE fecha_aprobacion
            END,
            observaciones      = $12,
            updated_at         = now()
          WHERE id = $1 AND updated_at = $2::timestamptz
          RETURNING id, updated_at::text AS updated_at
        ),
        del_trabajos AS (
          DELETE FROM orden_trabajo_trabajos
          WHERE orden_trabajo_id = (SELECT id FROM upd)
            AND trabajo_id != ALL($13::int[])
        ),
        del_repuestos AS (
          DELETE FROM orden_trabajo_repuestos
          WHERE orden_trabajo_id = (SELECT id FROM upd)
            AND repuesto_id != ALL($14::int[])
        ),
        ins_trabajos AS (
          INSERT INTO orden_trabajo_trabajos (orden_trabajo_id, trabajo_id)
          SELECT (SELECT id FROM upd), unnest($13::int[])
          WHERE (SELECT id FROM upd) IS NOT NULL
          ON CONFLICT DO NOTHING
        ),
        ins_repuestos AS (
          INSERT INTO orden_trabajo_repuestos (orden_trabajo_id, repuesto_id, precio, cantidad)
          SELECT
            (SELECT id FROM upd),
            unnest($14::int[]),
            unnest($15::int[]),
            unnest($16::int[])
          WHERE (SELECT id FROM upd) IS NOT NULL
          ON CONFLICT (orden_trabajo_id, repuesto_id) DO UPDATE
            SET precio = EXCLUDED.precio, cantidad = EXCLUDED.cantidad
        )
      SELECT id, updated_at FROM upd
    `,
    [
      id,
      input.updatedAt,
      clienteId,
      marcaId,
      modeloId,
      motorId,
      input.numeroSerieMotor,
      input.cobrado,
      input.prioridad,
      input.estado,
      input.listaPrecios,
      input.observaciones || null,
      trabajosIds,
      repuestosIds,
      precios,
      cantidades,
    ]
  );

  return rows[0]?.id
    ? { updatedAt: rows[0].updated_at }
    : "conflict";
}

export async function createTrabajo(input: TrabajoFormValues) {
  const clienteId = input.clienteId ? Number(input.clienteId) : null;
  const marcaId = input.marcaId ? Number(input.marcaId) : null;
  const modeloId = input.modeloId ? Number(input.modeloId) : null;
  const motorId = input.motorId ? Number(input.motorId) : null;
  const fechaAprobacion =
    input.estado === "aprobado" ? new Date().toISOString() : null;

  const insertedTrabajo = await templateRows<{ id: number }>`
    INSERT INTO ordenes_trabajo (
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

  const trabajoId = insertedTrabajo[0]?.id ?? null;

  if (!trabajoId) {
    return null;
  }

  if (input.trabajosIds.length > 0) {
    const valuesSql = input.trabajosIds
      .map((trabajoCatalogoId) => `(${trabajoId}, ${Number(trabajoCatalogoId)})`)
      .join(", ");

    await queryRows(
      `
        INSERT INTO orden_trabajo_trabajos (orden_trabajo_id, trabajo_id)
        VALUES ${valuesSql}
        ON CONFLICT (orden_trabajo_id, trabajo_id) DO NOTHING
      `
    );
  }

  if (input.repuestos.length > 0) {
    const valuesSql = input.repuestos
      .map(
        (repuesto) =>
          `(${trabajoId}, ${Number(repuesto.repuestoId)}, ${repuesto.precioUnitario}::numeric, ${repuesto.cantidad}::integer)`
      )
      .join(", ");

    await queryRows(
      `
        INSERT INTO orden_trabajo_repuestos (orden_trabajo_id, repuesto_id, precio, cantidad)
        VALUES ${valuesSql}
        ON CONFLICT (orden_trabajo_id, repuesto_id) DO NOTHING
      `
    );
  }

  return trabajoId;
}

export async function listTrabajosByCliente(clienteId: number) {
  const rows = await queryRows<TrabajoListRow>(
    `
      SELECT
        p.id,
        p.numero_trabajo,
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
      FROM ordenes_trabajo p
      LEFT JOIN clientes c ON c.id = p.cliente_id
      WHERE p.cliente_id = $1
      ORDER BY
        CASE
          WHEN p.estado = 'pendiente' THEN 1
          WHEN p.estado = 'aprobado' THEN 2
          ELSE 3
        END,
        p.numero_trabajo DESC
    `,
    [clienteId]
  );

  return hydrateTechnicalLabels(rows);
}
