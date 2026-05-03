import { queryRows } from "@/lib/db";

export type CobradoMensualRow = {
  mes: number;
  cantidad: number;
  total: number;
};

export type CobradoAnualRow = {
  anio: number;
  cantidad: number;
  total: number;
};

export async function getAniosConCobrados(): Promise<number[]> {
  const rows = await queryRows<{ anio: number }>(`
    SELECT DISTINCT EXTRACT(YEAR FROM fecha_creacion)::int AS anio
    FROM ordenes_trabajo
    WHERE cobrado = true
    ORDER BY anio DESC
  `);
  return rows.map((r) => r.anio);
}

export async function getCobradosMensuales(anio: number): Promise<CobradoMensualRow[]> {
  return queryRows<CobradoMensualRow>(
    `
      WITH ordenes_filtradas AS (
        SELECT id, fecha_creacion
        FROM ordenes_trabajo
        WHERE cobrado = true
          AND fecha_creacion >= make_date($1::int, 1, 1)
          AND fecha_creacion < make_date($1::int + 1, 1, 1)
      ),
      totales_trabajos AS (
        SELECT ott.orden_trabajo_id, SUM(ott.precio_snapshot)::int AS total_trabajos
        FROM orden_trabajo_trabajos ott
        INNER JOIN ordenes_filtradas ot ON ot.id = ott.orden_trabajo_id
        GROUP BY ott.orden_trabajo_id
      ),
      totales_repuestos AS (
        SELECT otr.orden_trabajo_id, SUM(otr.precio * otr.cantidad)::int AS total_repuestos
        FROM orden_trabajo_repuestos otr
        INNER JOIN ordenes_filtradas ot ON ot.id = otr.orden_trabajo_id
        GROUP BY otr.orden_trabajo_id
      )
      SELECT
        EXTRACT(MONTH FROM ot.fecha_creacion)::int AS mes,
        COUNT(*)::int AS cantidad,
        COALESCE(SUM(COALESCE(tt.total_trabajos, 0) + COALESCE(tr.total_repuestos, 0)), 0)::int AS total
      FROM ordenes_filtradas ot
      LEFT JOIN totales_trabajos tt ON tt.orden_trabajo_id = ot.id
      LEFT JOIN totales_repuestos tr ON tr.orden_trabajo_id = ot.id
      GROUP BY mes
      ORDER BY mes
    `,
    [anio]
  );
}

export async function getResumenAnual(): Promise<CobradoAnualRow[]> {
  return queryRows<CobradoAnualRow>(`
    WITH ordenes_cobradas AS (
      SELECT id, fecha_creacion
      FROM ordenes_trabajo
      WHERE cobrado = true
    ),
    totales_trabajos AS (
      SELECT ott.orden_trabajo_id, SUM(ott.precio_snapshot)::int AS total_trabajos
      FROM orden_trabajo_trabajos ott
      INNER JOIN ordenes_cobradas ot ON ot.id = ott.orden_trabajo_id
      GROUP BY ott.orden_trabajo_id
    ),
    totales_repuestos AS (
      SELECT otr.orden_trabajo_id, SUM(otr.precio * otr.cantidad)::int AS total_repuestos
      FROM orden_trabajo_repuestos otr
      INNER JOIN ordenes_cobradas ot ON ot.id = otr.orden_trabajo_id
      GROUP BY otr.orden_trabajo_id
    )
    SELECT
      EXTRACT(YEAR FROM ot.fecha_creacion)::int AS anio,
      COUNT(*)::int AS cantidad,
      COALESCE(SUM(COALESCE(tt.total_trabajos, 0) + COALESCE(tr.total_repuestos, 0)), 0)::int AS total
    FROM ordenes_cobradas ot
    LEFT JOIN totales_trabajos tt ON tt.orden_trabajo_id = ot.id
    LEFT JOIN totales_repuestos tr ON tr.orden_trabajo_id = ot.id
    GROUP BY anio
    ORDER BY anio DESC
  `);
}
