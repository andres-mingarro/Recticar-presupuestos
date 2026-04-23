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

type TrabajoCatalogSnapshot = {
  trabajoId: number;
  categoriaNombreSnapshot: string;
  trabajoNombreSnapshot: string;
  precioSnapshot: number;
};

type RepuestoCatalogSnapshot = {
  repuestoId: number;
  categoriaNombreSnapshot: string;
  repuestoNombreSnapshot: string;
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

function normalizeLegacyTrabajoEstado<T extends {
  estado: TrabajoEstado;
  fecha_creacion: string;
  fecha_presupuesto_entregado: string | null;
}>(row: T): T {
  if (row.estado !== "pendiente") {
    return row;
  }

  return {
    ...row,
    estado: "presupuesto_entregado",
    fecha_presupuesto_entregado: row.fecha_presupuesto_entregado ?? row.fecha_creacion,
  };
}

async function getTrabajoCatalogSnapshots(
  trabajosIds: number[],
  listaPrecios: 1 | 2 | 3
): Promise<TrabajoCatalogSnapshot[]> {
  if (trabajosIds.length === 0) return [];

  const precioCol =
    listaPrecios === 3 ? "t.precio_lista_3" : listaPrecios === 2 ? "t.precio_lista_2" : "t.precio_lista_1";

  const rows = await queryRows<{
    trabajo_id: number;
    categoria_nombre_snapshot: string;
    trabajo_nombre_snapshot: string;
    precio_snapshot: number;
  }>(
    `
      SELECT
        t.id AS trabajo_id,
        c.nombre AS categoria_nombre_snapshot,
        t.nombre AS trabajo_nombre_snapshot,
        ${precioCol} AS precio_snapshot
      FROM trabajos t
      INNER JOIN categorias_trabajo c ON c.id = t.categoria_id
      WHERE t.id = ANY($1::int[])
      ORDER BY array_position($1::int[], t.id)
    `,
    [trabajosIds]
  );

  if (rows.length !== trabajosIds.length) {
    throw new Error("Uno o más trabajos del catálogo ya no existen.");
  }

  return rows.map((row) => ({
    trabajoId: row.trabajo_id,
    categoriaNombreSnapshot: row.categoria_nombre_snapshot,
    trabajoNombreSnapshot: row.trabajo_nombre_snapshot,
    precioSnapshot: Number(row.precio_snapshot),
  }));
}

async function getRepuestoCatalogSnapshots(
  repuestosIds: number[]
): Promise<RepuestoCatalogSnapshot[]> {
  if (repuestosIds.length === 0) return [];

  const rows = await queryRows<{
    repuesto_id: number;
    categoria_nombre_snapshot: string;
    repuesto_nombre_snapshot: string;
  }>(
    `
      SELECT
        r.id AS repuesto_id,
        c.nombre AS categoria_nombre_snapshot,
        r.nombre AS repuesto_nombre_snapshot
      FROM repuestos r
      INNER JOIN categorias_repuesto c ON c.id = r.categoria_id
      WHERE r.id = ANY($1::int[])
      ORDER BY array_position($1::int[], r.id)
    `,
    [repuestosIds]
  );

  if (rows.length !== repuestosIds.length) {
    throw new Error("Uno o más repuestos del catálogo ya no existen.");
  }

  return rows.map((row) => ({
    repuestoId: row.repuesto_id,
    categoriaNombreSnapshot: row.categoria_nombre_snapshot,
    repuestoNombreSnapshot: row.repuesto_nombre_snapshot,
  }));
}

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
          p.fecha_presupuesto_entregado,
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

  return rows.map((item) => {
    const normalizedItem = normalizeLegacyTrabajoEstado(item);

    return {
      ...normalizedItem,
      marca_nombre: normalizedItem.marca_id ? (marcasById.get(normalizedItem.marca_id) ?? null) : null,
      modelo_nombre: normalizedItem.modelo_id ? (modelosById.get(normalizedItem.modelo_id) ?? null) : null,
      motor_nombre: normalizedItem.motor_id ? (motoresById.get(normalizedItem.motor_id) ?? null) : null,
    };
  });
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
        p.fecha_presupuesto_entregado,
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

  const hydrated = await hydrateTechnicalLabels(rows.map(normalizeLegacyTrabajoEstado));
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
        p.fecha_presupuesto_entregado,
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
        p.aplica_iva,
        (
          SELECT array_agg(pt.trabajo_id ORDER BY pt.trabajo_id) FILTER (WHERE pt.trabajo_id IS NOT NULL)
          FROM orden_trabajo_trabajos pt
          WHERE pt.orden_trabajo_id = p.id
        ) AS trabajos_ids,
        (
          SELECT array_agg(pr.repuesto_id ORDER BY pr.repuesto_id) FILTER (WHERE pr.repuesto_id IS NOT NULL)
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
        AND pr.repuesto_id IS NOT NULL
      ORDER BY pr.repuesto_id ASC
    `,
    [id]
  );

  const hydrated = await hydrateTechnicalLabels([
    {
      ...normalizeLegacyTrabajoEstado(row),
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
  const trabajoSnapshots = await getTrabajoCatalogSnapshots(trabajosIds, input.listaPrecios);
  const repuestosIds = input.repuestos.map((r) => Number(r.repuestoId));
  const repuestoSnapshots = await getRepuestoCatalogSnapshots(repuestosIds);
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
            aplica_iva         = $12,
            fecha_presupuesto_entregado = CASE
              WHEN $10::text = 'presupuesto_entregado' AND fecha_presupuesto_entregado IS NULL THEN now()
              WHEN $10::text <> 'presupuesto_entregado' THEN NULL
              ELSE fecha_presupuesto_entregado
            END,
            fecha_aprobacion   = CASE
              WHEN $10::text = 'aprobado' AND fecha_aprobacion IS NULL THEN now()
              ELSE fecha_aprobacion
            END,
            observaciones      = $13,
            updated_at         = now()
          WHERE id = $1 AND updated_at = $2::timestamptz
          RETURNING id, updated_at::text AS updated_at
        ),
        del_trabajos AS (
          DELETE FROM orden_trabajo_trabajos
          WHERE orden_trabajo_id = (SELECT id FROM upd)
            AND trabajo_id != ALL($14::int[])
        ),
        del_repuestos AS (
          DELETE FROM orden_trabajo_repuestos
          WHERE orden_trabajo_id = (SELECT id FROM upd)
            AND repuesto_id != ALL($15::int[])
        ),
        ins_trabajos AS (
          INSERT INTO orden_trabajo_trabajos (
            orden_trabajo_id,
            trabajo_id,
            categoria_nombre_snapshot,
            trabajo_nombre_snapshot,
            precio_snapshot
          )
          SELECT
            (SELECT id FROM upd),
            unnest($14::int[]),
            unnest($18::text[]),
            unnest($19::text[]),
            unnest($20::numeric[])
          WHERE (SELECT id FROM upd) IS NOT NULL
          ON CONFLICT (orden_trabajo_id, trabajo_id) DO UPDATE
            SET
              categoria_nombre_snapshot = EXCLUDED.categoria_nombre_snapshot,
              trabajo_nombre_snapshot = EXCLUDED.trabajo_nombre_snapshot,
              precio_snapshot = EXCLUDED.precio_snapshot
        ),
        ins_repuestos AS (
          INSERT INTO orden_trabajo_repuestos (
            orden_trabajo_id,
            repuesto_id,
            precio,
            cantidad,
            categoria_nombre_snapshot,
            repuesto_nombre_snapshot
          )
          SELECT
            (SELECT id FROM upd),
            unnest($15::int[]),
            unnest($16::int[]),
            unnest($17::int[]),
            unnest($21::text[]),
            unnest($22::text[])
          WHERE (SELECT id FROM upd) IS NOT NULL
          ON CONFLICT (orden_trabajo_id, repuesto_id) DO UPDATE
            SET
              precio = EXCLUDED.precio,
              cantidad = EXCLUDED.cantidad,
              categoria_nombre_snapshot = EXCLUDED.categoria_nombre_snapshot,
              repuesto_nombre_snapshot = EXCLUDED.repuesto_nombre_snapshot
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
      input.aplicaIva,
      input.observaciones || null,
      trabajosIds,
      repuestosIds,
      precios,
      cantidades,
      trabajoSnapshots.map((item) => item.categoriaNombreSnapshot),
      trabajoSnapshots.map((item) => item.trabajoNombreSnapshot),
      trabajoSnapshots.map((item) => item.precioSnapshot),
      repuestoSnapshots.map((item) => item.categoriaNombreSnapshot),
      repuestoSnapshots.map((item) => item.repuestoNombreSnapshot),
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
  const trabajosIds = input.trabajosIds.map(Number);
  const trabajoSnapshots = await getTrabajoCatalogSnapshots(trabajosIds, input.listaPrecios);
  const repuestosIds = input.repuestos.map((r) => Number(r.repuestoId));
  const repuestoSnapshots = await getRepuestoCatalogSnapshots(repuestosIds);
  const fechaAprobacion =
    input.estado === "aprobado" ? new Date().toISOString() : null;
  const fechaPresupuestoEntregado =
    input.estado === "presupuesto_entregado" ? new Date().toISOString() : null;

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
      fecha_presupuesto_entregado,
      fecha_aprobacion,
      observaciones,
      lista_precio,
      aplica_iva
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
      ${fechaPresupuestoEntregado},
      ${fechaAprobacion},
      ${input.observaciones || null},
      ${input.listaPrecios},
      ${input.aplicaIva}
    )
    RETURNING id
  `;

  const trabajoId = insertedTrabajo[0]?.id ?? null;

  if (!trabajoId) {
    return null;
  }

  if (trabajoSnapshots.length > 0) {
    await queryRows(
      `
        INSERT INTO orden_trabajo_trabajos (
          orden_trabajo_id,
          trabajo_id,
          categoria_nombre_snapshot,
          trabajo_nombre_snapshot,
          precio_snapshot
        )
        SELECT
          $1,
          unnest($2::int[]),
          unnest($3::text[]),
          unnest($4::text[]),
          unnest($5::numeric[])
        ON CONFLICT (orden_trabajo_id, trabajo_id) DO UPDATE
          SET
            categoria_nombre_snapshot = EXCLUDED.categoria_nombre_snapshot,
            trabajo_nombre_snapshot = EXCLUDED.trabajo_nombre_snapshot,
            precio_snapshot = EXCLUDED.precio_snapshot
      `,
      [
        trabajoId,
        trabajoSnapshots.map((item) => item.trabajoId),
        trabajoSnapshots.map((item) => item.categoriaNombreSnapshot),
        trabajoSnapshots.map((item) => item.trabajoNombreSnapshot),
        trabajoSnapshots.map((item) => item.precioSnapshot),
      ]
    );
  }

  if (input.repuestos.length > 0) {
    await queryRows(
      `
        INSERT INTO orden_trabajo_repuestos (
          orden_trabajo_id,
          repuesto_id,
          precio,
          cantidad,
          categoria_nombre_snapshot,
          repuesto_nombre_snapshot
        )
        SELECT
          $1,
          unnest($2::int[]),
          unnest($3::int[]),
          unnest($4::int[]),
          unnest($5::text[]),
          unnest($6::text[])
        ON CONFLICT (orden_trabajo_id, repuesto_id) DO UPDATE
          SET
            precio = EXCLUDED.precio,
            cantidad = EXCLUDED.cantidad,
            categoria_nombre_snapshot = EXCLUDED.categoria_nombre_snapshot,
            repuesto_nombre_snapshot = EXCLUDED.repuesto_nombre_snapshot
      `,
      [
        trabajoId,
        repuestosIds,
        input.repuestos.map((repuesto) => repuesto.precioUnitario),
        input.repuestos.map((repuesto) => repuesto.cantidad),
        repuestoSnapshots.map((item) => item.categoriaNombreSnapshot),
        repuestoSnapshots.map((item) => item.repuestoNombreSnapshot),
      ]
    );
  }

  return trabajoId;
}

export async function refreshTrabajoSnapshotPrices(id: number) {
  const rows = await queryRows<{ updated_count: number }>(
    `
      WITH trabajo_snapshot_source AS (
        SELECT
          ott.orden_trabajo_id,
          ott.trabajo_id,
          c.nombre AS categoria_nombre_snapshot,
          t.nombre AS trabajo_nombre_snapshot,
          CASE ot.lista_precio
            WHEN 3 THEN t.precio_lista_3
            WHEN 2 THEN t.precio_lista_2
            ELSE t.precio_lista_1
          END AS precio_snapshot
        FROM orden_trabajo_trabajos ott
        INNER JOIN ordenes_trabajo ot ON ot.id = ott.orden_trabajo_id
        INNER JOIN trabajos t ON t.id = ott.trabajo_id
        INNER JOIN categorias_trabajo c ON c.id = t.categoria_id
        WHERE ott.orden_trabajo_id = $1
          AND ott.trabajo_id IS NOT NULL
      ),
      upd_trabajos AS (
        UPDATE orden_trabajo_trabajos ott
        SET
          categoria_nombre_snapshot = src.categoria_nombre_snapshot,
          trabajo_nombre_snapshot = src.trabajo_nombre_snapshot,
          precio_snapshot = src.precio_snapshot
        FROM trabajo_snapshot_source src
        WHERE ott.orden_trabajo_id = src.orden_trabajo_id
          AND ott.trabajo_id = src.trabajo_id
        RETURNING 1
      ),
      repuesto_snapshot_source AS (
        SELECT
          otr.orden_trabajo_id,
          otr.repuesto_id,
          c.nombre AS categoria_nombre_snapshot,
          r.nombre AS repuesto_nombre_snapshot
        FROM orden_trabajo_repuestos otr
        INNER JOIN repuestos r ON r.id = otr.repuesto_id
        INNER JOIN categorias_repuesto c ON c.id = r.categoria_id
        WHERE otr.orden_trabajo_id = $1
          AND otr.repuesto_id IS NOT NULL
      ),
      upd_repuestos AS (
        UPDATE orden_trabajo_repuestos otr
        SET
          categoria_nombre_snapshot = src.categoria_nombre_snapshot,
          repuesto_nombre_snapshot = src.repuesto_nombre_snapshot
        FROM repuesto_snapshot_source src
        WHERE otr.orden_trabajo_id = src.orden_trabajo_id
          AND otr.repuesto_id = src.repuesto_id
        RETURNING 1
      )
      SELECT (
        SELECT COUNT(*)::int FROM upd_trabajos
      ) + (
        SELECT COUNT(*)::int FROM upd_repuestos
      ) AS updated_count
    `,
    [id]
  );

  return rows[0]?.updated_count ?? 0;
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
        p.fecha_presupuesto_entregado,
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
          WHEN p.estado = 'presupuesto_entregado' THEN 1
          WHEN p.estado = 'aprobado' THEN 2
          WHEN p.estado = 'finalizado' THEN 3
          WHEN p.estado = 'pendiente' THEN 4
          ELSE 5
        END,
        p.numero_trabajo DESC
    `,
    [clienteId]
  );

  return hydrateTechnicalLabels(rows.map(normalizeLegacyTrabajoEstado));
}

export type DashboardStats = {
  trabajosActivos: number;
  trabajosSinCobrar: number;
  trabajosAltaPrioridad: number;
  clientesTotales: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const rows = await queryRows<DashboardStats>(`
    SELECT
      COUNT(*) FILTER (WHERE estado IN ('presupuesto_entregado', 'aprobado'))::int AS "trabajosActivos",
      COUNT(*) FILTER (WHERE cobrado = false AND estado != 'finalizado')::int AS "trabajosSinCobrar",
      COUNT(*) FILTER (WHERE prioridad = 'alta' AND estado IN ('presupuesto_entregado', 'aprobado'))::int AS "trabajosAltaPrioridad",
      (SELECT COUNT(*)::int FROM clientes) AS "clientesTotales"
    FROM ordenes_trabajo
  `);
  return rows[0] ?? { trabajosActivos: 0, trabajosSinCobrar: 0, trabajosAltaPrioridad: 0, clientesTotales: 0 };
}

export type TrabajoAprobadoRow = {
  id: number;
  numero_trabajo: number;
  cliente_nombre: string | null;
  prioridad: TrabajoPrioridad;
  fecha_aprobacion: string | null;
  dias_desde_aprobacion: number;
};

export async function listTrabajosAprobados(limit = 8): Promise<TrabajoAprobadoRow[]> {
  return queryRows<TrabajoAprobadoRow>(`
    SELECT
      p.id,
      p.numero_trabajo,
      CASE WHEN c.id IS NULL THEN NULL ELSE concat(c.apellido, ', ', c.nombre) END AS cliente_nombre,
      p.prioridad,
      p.fecha_aprobacion,
      EXTRACT(DAY FROM now() - p.fecha_aprobacion)::int AS dias_desde_aprobacion
    FROM ordenes_trabajo p
    LEFT JOIN clientes c ON c.id = p.cliente_id
    WHERE p.estado = 'aprobado'
    ORDER BY
      CASE p.prioridad WHEN 'alta' THEN 1 WHEN 'normal' THEN 2 ELSE 3 END,
      p.fecha_aprobacion ASC
    LIMIT $1
  `, [limit]);
}

export type PresupuestoVencidoRow = {
  id: number;
  numero_trabajo: number;
  cliente_nombre: string | null;
  fecha_presupuesto_entregado: string;
  dias_esperando: number;
};

export async function listPresupuestosVencidos(diasMinimos = 7, limit = 5): Promise<PresupuestoVencidoRow[]> {
  return queryRows<PresupuestoVencidoRow>(`
    SELECT
      p.id,
      p.numero_trabajo,
      CASE WHEN c.id IS NULL THEN NULL ELSE concat(c.apellido, ', ', c.nombre) END AS cliente_nombre,
      p.fecha_presupuesto_entregado,
      EXTRACT(DAY FROM now() - p.fecha_presupuesto_entregado)::int AS dias_esperando
    FROM ordenes_trabajo p
    LEFT JOIN clientes c ON c.id = p.cliente_id
    WHERE p.estado IN ('presupuesto_entregado', 'pendiente')
      AND p.fecha_presupuesto_entregado IS NOT NULL
      AND p.fecha_presupuesto_entregado < now() - ($1 || ' days')::interval
    ORDER BY p.fecha_presupuesto_entregado ASC
    LIMIT $2
  `, [diasMinimos, limit]);
}

export type MotorMasUsadoRow = {
  motor_id: number;
  cantidad: number;
};

export async function listMotoresMasUsados(limit = 5): Promise<MotorMasUsadoRow[]> {
  return queryRows<MotorMasUsadoRow>(`
    SELECT
      motor_id,
      COUNT(*)::int AS cantidad
    FROM ordenes_trabajo
    WHERE motor_id IS NOT NULL
    GROUP BY motor_id
    ORDER BY cantidad DESC
    LIMIT $1
  `, [limit]);
}

export type RepuestoMasUsadoRow = {
  repuesto_nombre_snapshot: string;
  cantidad: number;
};

export async function listRepuestosMasUsados(limit = 5): Promise<RepuestoMasUsadoRow[]> {
  return queryRows<RepuestoMasUsadoRow>(`
    SELECT
      repuesto_nombre_snapshot,
      COUNT(*)::int AS cantidad
    FROM orden_trabajo_repuestos
    WHERE repuesto_nombre_snapshot IS NOT NULL AND repuesto_nombre_snapshot != ''
    GROUP BY repuesto_nombre_snapshot
    ORDER BY cantidad DESC
    LIMIT $1
  `, [limit]);
}
