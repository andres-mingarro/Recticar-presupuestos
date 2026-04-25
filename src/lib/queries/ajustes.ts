import { queryRows } from "@/lib/db";

export type AjusteListaPreciosRow = {
  categoria_id: number;
  categoria_nombre: string;
  mes_lista_1: number;
  mes_lista_2: number;
  mes_lista_3: number;
  anio_lista_1: number;
  anio_lista_2: number;
  anio_lista_3: number;
  doce_meses_lista_1: number;
  doce_meses_lista_2: number;
  doce_meses_lista_3: number;
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

export async function listHistorialAjustes(): Promise<AjusteListaPreciosRow[]> {
  return queryRows<AjusteListaPreciosRow>(`
    SELECT
      categoria_id,
      categoria_nombre,
      ROUND(SUM(ajuste_lista_1) FILTER (WHERE fecha >= date_trunc('month', now()))::numeric, 2)::float AS mes_lista_1,
      ROUND(SUM(ajuste_lista_2) FILTER (WHERE fecha >= date_trunc('month', now()))::numeric, 2)::float AS mes_lista_2,
      ROUND(SUM(ajuste_lista_3) FILTER (WHERE fecha >= date_trunc('month', now()))::numeric, 2)::float AS mes_lista_3,
      ROUND(SUM(ajuste_lista_1) FILTER (WHERE fecha >= date_trunc('year', now()))::numeric, 2)::float AS anio_lista_1,
      ROUND(SUM(ajuste_lista_2) FILTER (WHERE fecha >= date_trunc('year', now()))::numeric, 2)::float AS anio_lista_2,
      ROUND(SUM(ajuste_lista_3) FILTER (WHERE fecha >= date_trunc('year', now()))::numeric, 2)::float AS anio_lista_3,
      ROUND(SUM(ajuste_lista_1) FILTER (WHERE fecha >= now() - interval '12 months')::numeric, 2)::float AS doce_meses_lista_1,
      ROUND(SUM(ajuste_lista_2) FILTER (WHERE fecha >= now() - interval '12 months')::numeric, 2)::float AS doce_meses_lista_2,
      ROUND(SUM(ajuste_lista_3) FILTER (WHERE fecha >= now() - interval '12 months')::numeric, 2)::float AS doce_meses_lista_3
    FROM ajustes_lista_precios
    GROUP BY categoria_id, categoria_nombre
    ORDER BY categoria_nombre ASC
  `);
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
