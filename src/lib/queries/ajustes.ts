import { queryRows } from "@/lib/db";

export type AjusteListaPreciosRow = {
  categoria_id: number;
  categoria_nombre: string;
  mes_lista_1: number;
  mes_lista_2: number;
  mes_lista_3: number;
  mes_lista_4: number;
  mes_lista_5: number;
  anio_lista_1: number;
  anio_lista_2: number;
  anio_lista_3: number;
  anio_lista_4: number;
  anio_lista_5: number;
  doce_meses_lista_1: number;
  doce_meses_lista_2: number;
  doce_meses_lista_3: number;
  doce_meses_lista_4: number;
  doce_meses_lista_5: number;
};

export type AcumuladoAjustes = {
  total_lista_1: number;
  total_lista_2: number;
  total_lista_3: number;
  total_lista_4: number;
  total_lista_5: number;
};

export async function registrarAjuste(
  categoriaId: number,
  categoriaNombre: string,
  ...ajustes: [number, number, number, number, number]
): Promise<void> {
  if (ajustes.every((a) => a === 0)) return;

  await queryRows(
    `
      INSERT INTO ajustes_lista_precios
        (categoria_id, categoria_nombre, ajuste_lista_1, ajuste_lista_2, ajuste_lista_3, ajuste_lista_4, ajuste_lista_5)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
    [categoriaId, categoriaNombre, ...ajustes]
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
      ROUND(SUM(ajuste_lista_4) FILTER (WHERE fecha >= date_trunc('month', now()))::numeric, 2)::float AS mes_lista_4,
      ROUND(SUM(ajuste_lista_5) FILTER (WHERE fecha >= date_trunc('month', now()))::numeric, 2)::float AS mes_lista_5,
      ROUND(SUM(ajuste_lista_1) FILTER (WHERE fecha >= date_trunc('year', now()))::numeric, 2)::float AS anio_lista_1,
      ROUND(SUM(ajuste_lista_2) FILTER (WHERE fecha >= date_trunc('year', now()))::numeric, 2)::float AS anio_lista_2,
      ROUND(SUM(ajuste_lista_3) FILTER (WHERE fecha >= date_trunc('year', now()))::numeric, 2)::float AS anio_lista_3,
      ROUND(SUM(ajuste_lista_4) FILTER (WHERE fecha >= date_trunc('year', now()))::numeric, 2)::float AS anio_lista_4,
      ROUND(SUM(ajuste_lista_5) FILTER (WHERE fecha >= date_trunc('year', now()))::numeric, 2)::float AS anio_lista_5,
      ROUND(SUM(ajuste_lista_1) FILTER (WHERE fecha >= now() - interval '12 months')::numeric, 2)::float AS doce_meses_lista_1,
      ROUND(SUM(ajuste_lista_2) FILTER (WHERE fecha >= now() - interval '12 months')::numeric, 2)::float AS doce_meses_lista_2,
      ROUND(SUM(ajuste_lista_3) FILTER (WHERE fecha >= now() - interval '12 months')::numeric, 2)::float AS doce_meses_lista_3,
      ROUND(SUM(ajuste_lista_4) FILTER (WHERE fecha >= now() - interval '12 months')::numeric, 2)::float AS doce_meses_lista_4,
      ROUND(SUM(ajuste_lista_5) FILTER (WHERE fecha >= now() - interval '12 months')::numeric, 2)::float AS doce_meses_lista_5
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
      COALESCE(ROUND(SUM(ajuste_lista_3)::numeric, 2), 0)::float AS total_lista_3,
      COALESCE(ROUND(SUM(ajuste_lista_4)::numeric, 2), 0)::float AS total_lista_4,
      COALESCE(ROUND(SUM(ajuste_lista_5)::numeric, 2), 0)::float AS total_lista_5
    FROM (
      SELECT
        fecha::date AS dia,
        AVG(ajuste_lista_1) AS ajuste_lista_1,
        AVG(ajuste_lista_2) AS ajuste_lista_2,
        AVG(ajuste_lista_3) AS ajuste_lista_3,
        AVG(ajuste_lista_4) AS ajuste_lista_4,
        AVG(ajuste_lista_5) AS ajuste_lista_5
      FROM ajustes_lista_precios
      GROUP BY dia
    ) daily_avg
  `);
  return rows[0] ?? { total_lista_1: 0, total_lista_2: 0, total_lista_3: 0, total_lista_4: 0, total_lista_5: 0 };
}
