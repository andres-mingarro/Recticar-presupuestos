import { queryRows } from "@/lib/db";

export type CobradoMensualRow = {
  mes: number;
  cantidad: number;
};

export type CobradoAnualRow = {
  anio: number;
  cantidad: number;
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
      SELECT
        EXTRACT(MONTH FROM fecha_creacion)::int AS mes,
        COUNT(*)::int AS cantidad
      FROM ordenes_trabajo
      WHERE cobrado = true
        AND EXTRACT(YEAR FROM fecha_creacion) = $1
      GROUP BY mes
      ORDER BY mes
    `,
    [anio]
  );
}

export async function getResumenAnual(): Promise<CobradoAnualRow[]> {
  return queryRows<CobradoAnualRow>(`
    SELECT
      EXTRACT(YEAR FROM fecha_creacion)::int AS anio,
      COUNT(*)::int AS cantidad
    FROM ordenes_trabajo
    WHERE cobrado = true
    GROUP BY anio
    ORDER BY anio DESC
  `);
}
