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
      WITH totales_trabajos AS (
        SELECT orden_trabajo_id, SUM(precio_snapshot)::int AS total_trabajos
        FROM orden_trabajo_trabajos
        GROUP BY orden_trabajo_id
      ),
      totales_repuestos AS (
        SELECT orden_trabajo_id, SUM(precio * cantidad)::int AS total_repuestos
        FROM orden_trabajo_repuestos
        GROUP BY orden_trabajo_id
      )
      SELECT
        EXTRACT(MONTH FROM ot.fecha_creacion)::int AS mes,
        COUNT(*)::int AS cantidad,
        COALESCE(SUM(COALESCE(tt.total_trabajos, 0) + COALESCE(tr.total_repuestos, 0)), 0)::int AS total
      FROM ordenes_trabajo ot
      LEFT JOIN totales_trabajos tt ON tt.orden_trabajo_id = ot.id
      LEFT JOIN totales_repuestos tr ON tr.orden_trabajo_id = ot.id
      WHERE ot.cobrado = true
        AND EXTRACT(YEAR FROM ot.fecha_creacion) = $1
      GROUP BY mes
      ORDER BY mes
    `,
    [anio]
  );
}

export async function getResumenAnual(): Promise<CobradoAnualRow[]> {
  return queryRows<CobradoAnualRow>(`
    WITH totales_trabajos AS (
      SELECT orden_trabajo_id, SUM(precio_snapshot)::int AS total_trabajos
      FROM orden_trabajo_trabajos
      GROUP BY orden_trabajo_id
    ),
    totales_repuestos AS (
      SELECT orden_trabajo_id, SUM(precio * cantidad)::int AS total_repuestos
      FROM orden_trabajo_repuestos
      GROUP BY orden_trabajo_id
    )
    SELECT
      EXTRACT(YEAR FROM ot.fecha_creacion)::int AS anio,
      COUNT(*)::int AS cantidad,
      COALESCE(SUM(COALESCE(tt.total_trabajos, 0) + COALESCE(tr.total_repuestos, 0)), 0)::int AS total
    FROM ordenes_trabajo ot
    LEFT JOIN totales_trabajos tt ON tt.orden_trabajo_id = ot.id
    LEFT JOIN totales_repuestos tr ON tr.orden_trabajo_id = ot.id
    WHERE ot.cobrado = true
    GROUP BY anio
    ORDER BY anio DESC
  `);
}
