import { queryRows } from "@/lib/db";

export type AjusteListaPreciosRow = {
  id: number;
  fecha: string;
  categoria_id: number;
  categoria_nombre: string;
  ajuste_lista_1: number;
  ajuste_lista_2: number;
  ajuste_lista_3: number;
};

export type AcumuladoAjustes = {
  total_lista_1: number;
  total_lista_2: number;
  total_lista_3: number;
};

export async function registrarAjuste(
  categoriaId: number,
  categoriaNombre: string,
  ajusteLista1: number,
  ajusteLista2: number,
  ajusteLista3: number
): Promise<void> {
  if (ajusteLista1 === 0 && ajusteLista2 === 0 && ajusteLista3 === 0) return;

  await queryRows(
    `
      INSERT INTO ajustes_lista_precios
        (categoria_id, categoria_nombre, ajuste_lista_1, ajuste_lista_2, ajuste_lista_3)
      VALUES ($1, $2, $3, $4, $5)
    `,
    [categoriaId, categoriaNombre, ajusteLista1, ajusteLista2, ajusteLista3]
  );
}

export async function listHistorialAjustes(limit = 50): Promise<AjusteListaPreciosRow[]> {
  return queryRows<AjusteListaPreciosRow>(
    `
      SELECT
        id,
        fecha,
        categoria_id,
        categoria_nombre,
        ajuste_lista_1::float AS ajuste_lista_1,
        ajuste_lista_2::float AS ajuste_lista_2,
        ajuste_lista_3::float AS ajuste_lista_3
      FROM ajustes_lista_precios
      ORDER BY fecha DESC
      LIMIT $1
    `,
    [limit]
  );
}

export async function getAcumuladoAjustes(): Promise<AcumuladoAjustes> {
  // Por día: promedio simple entre categorías. Luego: suma de todos los días.
  const rows = await queryRows<AcumuladoAjustes>(`
    SELECT
      COALESCE(ROUND(SUM(ajuste_lista_1)::numeric, 2), 0)::float AS total_lista_1,
      COALESCE(ROUND(SUM(ajuste_lista_2)::numeric, 2), 0)::float AS total_lista_2,
      COALESCE(ROUND(SUM(ajuste_lista_3)::numeric, 2), 0)::float AS total_lista_3
    FROM (
      SELECT
        fecha::date AS dia,
        AVG(ajuste_lista_1) AS ajuste_lista_1,
        AVG(ajuste_lista_2) AS ajuste_lista_2,
        AVG(ajuste_lista_3) AS ajuste_lista_3
      FROM ajustes_lista_precios
      GROUP BY dia
    ) daily_avg
  `);
  return rows[0] ?? { total_lista_1: 0, total_lista_2: 0, total_lista_3: 0 };
}
