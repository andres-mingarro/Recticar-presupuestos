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
    SELECT DISTINCT EXTRACT(YEAR FROM fecha_cobrado)::int AS anio
    FROM ordenes_trabajo
    WHERE cobrado = true AND fecha_cobrado IS NOT NULL
    ORDER BY anio DESC
  `);
  return rows.map((r) => r.anio);
}

export async function getCobradosMensuales(anio: number): Promise<CobradoMensualRow[]> {
  return queryRows<CobradoMensualRow>(
    `
      SELECT
        EXTRACT(MONTH FROM fecha_cobrado)::int AS mes,
        COUNT(*)::int AS cantidad,
        COALESCE(SUM(monto_cobrado), 0)::int AS total
      FROM ordenes_trabajo
      WHERE cobrado = true
        AND fecha_cobrado >= make_date($1::int, 1, 1)
        AND fecha_cobrado < make_date($1::int + 1, 1, 1)
      GROUP BY mes
      ORDER BY mes
    `,
    [anio]
  );
}

export async function getResumenAnual(): Promise<CobradoAnualRow[]> {
  return queryRows<CobradoAnualRow>(`
    SELECT
      EXTRACT(YEAR FROM fecha_cobrado)::int AS anio,
      COUNT(*)::int AS cantidad,
      COALESCE(SUM(monto_cobrado), 0)::int AS total
    FROM ordenes_trabajo
    WHERE cobrado = true AND fecha_cobrado IS NOT NULL
    GROUP BY anio
    ORDER BY anio DESC
  `);
}
