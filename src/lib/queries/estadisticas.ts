import { queryRows } from "@/lib/db";
import type {
  EstadisticaCliente,
  EstadisticaComparacion,
  EstadisticaDistribucion,
  EstadisticaMensual,
  EstadisticaRanking,
  EstadisticasOperativas,
} from "@/lib/types";

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

export async function getEstadisticasOperativas(anio: number): Promise<EstadisticasOperativas> {
  const params = [anio];

  const [
    resumenRows,
    mensual,
    estados,
    prioridades,
    listasPrecio,
    iva,
    trabajosSolicitados,
    ingresosCategorias,
    repuestosUtilizados,
    clientesPrincipales,
    comparacionRows,
  ] = await Promise.all([
    queryRows<{
      creados: number;
      aprobados: number;
      promedio_dias_aprobacion: number | null;
      pendientes_cobro: number;
      monto_pendiente: number;
    }>(
      `
        WITH ordenes AS (
          SELECT
            ot.*,
            COALESCE((
              SELECT SUM(ott.precio_snapshot * ott.cantidad)
              FROM orden_trabajo_trabajos ott
              WHERE ott.orden_trabajo_id = ot.id
            ), 0)::int AS total_trabajos,
            COALESCE((
              SELECT SUM(
                otr.precio_stock * otr.cantidad_stock
                + otr.precio * GREATEST(otr.cantidad - otr.cantidad_stock, 0)
              )
              FROM orden_trabajo_repuestos otr
              WHERE otr.orden_trabajo_id = ot.id
            ), 0)::int AS total_repuestos
          FROM ordenes_trabajo ot
          WHERE ot.fecha_creacion >= make_date($1::int, 1, 1)
            AND ot.fecha_creacion < make_date($1::int + 1, 1, 1)
        )
        SELECT
          COUNT(*)::int AS creados,
          COUNT(*) FILTER (WHERE fecha_aprobacion IS NOT NULL)::int AS aprobados,
          ROUND(AVG(
            EXTRACT(EPOCH FROM (fecha_aprobacion - fecha_creacion)) / 86400
          ) FILTER (WHERE fecha_aprobacion IS NOT NULL)::numeric, 1)::float
            AS promedio_dias_aprobacion,
          COUNT(*) FILTER (
            WHERE cobrado = false
              AND estado::text IN ('aprobado', 'finalizado')
          )::int AS pendientes_cobro,
          COALESCE(SUM(
            total_trabajos
            + CASE WHEN aplica_iva THEN ROUND(total_trabajos * 0.21)::int ELSE 0 END
            + total_repuestos
          ) FILTER (
            WHERE cobrado = false
              AND estado::text IN ('aprobado', 'finalizado')
          ), 0)::int AS monto_pendiente
        FROM ordenes
      `,
      params
    ),
    queryRows<EstadisticaMensual>(
      `
        WITH meses AS (
          SELECT generate_series(1, 12)::int AS mes
        ),
        creados AS (
          SELECT EXTRACT(MONTH FROM fecha_creacion)::int AS mes, COUNT(*)::int AS cantidad
          FROM ordenes_trabajo
          WHERE fecha_creacion >= make_date($1::int, 1, 1)
            AND fecha_creacion < make_date($1::int + 1, 1, 1)
          GROUP BY 1
        ),
        cobrados AS (
          SELECT
            EXTRACT(MONTH FROM fecha_cobrado)::int AS mes,
            COUNT(*)::int AS cantidad,
            COALESCE(SUM(monto_cobrado), 0)::int AS total
          FROM ordenes_trabajo
          WHERE cobrado = true
            AND fecha_cobrado >= make_date($1::int, 1, 1)
            AND fecha_cobrado < make_date($1::int + 1, 1, 1)
          GROUP BY 1
        )
        SELECT
          m.mes,
          COALESCE(c.cantidad, 0)::int AS creados,
          COALESCE(co.cantidad, 0)::int AS cobrados,
          COALESCE(co.total, 0)::int AS "totalCobrado"
        FROM meses m
        LEFT JOIN creados c USING (mes)
        LEFT JOIN cobrados co USING (mes)
        ORDER BY m.mes
      `,
      params
    ),
    queryRows<EstadisticaDistribucion>(
      `
        SELECT
          CASE WHEN estado::text = 'pendiente' THEN 'presupuesto_entregado' ELSE estado::text END AS clave,
          COUNT(*)::int AS cantidad
        FROM ordenes_trabajo
        WHERE fecha_creacion >= make_date($1::int, 1, 1)
          AND fecha_creacion < make_date($1::int + 1, 1, 1)
          AND estado::text <> 'finalizado'
        GROUP BY 1
        ORDER BY 1
      `,
      params
    ),
    queryRows<EstadisticaDistribucion>(
      `
        SELECT prioridad::text AS clave, COUNT(*)::int AS cantidad
        FROM ordenes_trabajo
        WHERE fecha_creacion >= make_date($1::int, 1, 1)
          AND fecha_creacion < make_date($1::int + 1, 1, 1)
        GROUP BY prioridad
        ORDER BY CASE prioridad::text WHEN 'alta' THEN 1 WHEN 'normal' THEN 2 ELSE 3 END
      `,
      params
    ),
    queryRows<EstadisticaDistribucion>(
      `
        SELECT lista_precio::text AS clave, COUNT(*)::int AS cantidad
        FROM ordenes_trabajo
        WHERE fecha_creacion >= make_date($1::int, 1, 1)
          AND fecha_creacion < make_date($1::int + 1, 1, 1)
        GROUP BY lista_precio
        ORDER BY lista_precio
      `,
      params
    ),
    queryRows<EstadisticaDistribucion>(
      `
        SELECT
          CASE WHEN aplica_iva THEN 'con_iva' ELSE 'sin_iva' END AS clave,
          COUNT(*)::int AS cantidad,
          COALESCE(SUM(monto_cobrado), 0)::int AS total
        FROM ordenes_trabajo
        WHERE cobrado = true
          AND fecha_cobrado >= make_date($1::int, 1, 1)
          AND fecha_cobrado < make_date($1::int + 1, 1, 1)
        GROUP BY aplica_iva
        ORDER BY aplica_iva DESC
      `,
      params
    ),
    queryRows<EstadisticaRanking>(
      `
        SELECT
          ott.trabajo_id AS id,
          COALESCE(ott.trabajo_nombre_snapshot, t.nombre, 'Trabajo eliminado') AS nombre,
          COALESCE(ott.categoria_nombre_snapshot, ct.nombre, 'Sin categoría') AS categoria,
          COALESCE(SUM(ott.cantidad), 0)::int AS cantidad,
          COALESCE(SUM(ott.precio_snapshot * ott.cantidad), 0)::int AS total
        FROM orden_trabajo_trabajos ott
        INNER JOIN ordenes_trabajo ot ON ot.id = ott.orden_trabajo_id
        LEFT JOIN trabajos t ON t.id = ott.trabajo_id
        LEFT JOIN categorias_trabajo ct ON ct.id = t.categoria_id
        WHERE ot.cobrado = true
          AND ot.fecha_cobrado >= make_date($1::int, 1, 1)
          AND ot.fecha_cobrado < make_date($1::int + 1, 1, 1)
        GROUP BY
          ott.trabajo_id,
          COALESCE(ott.trabajo_nombre_snapshot, t.nombre, 'Trabajo eliminado'),
          COALESCE(ott.categoria_nombre_snapshot, ct.nombre, 'Sin categoría')
        ORDER BY cantidad DESC, total DESC
        LIMIT 8
      `,
      params
    ),
    queryRows<EstadisticaRanking>(
      `
        SELECT
          NULL::int AS id,
          COALESCE(ott.categoria_nombre_snapshot, ct.nombre, 'Sin categoría') AS nombre,
          NULL::text AS categoria,
          COALESCE(SUM(ott.cantidad), 0)::int AS cantidad,
          COALESCE(SUM(ott.precio_snapshot * ott.cantidad), 0)::int AS total
        FROM orden_trabajo_trabajos ott
        INNER JOIN ordenes_trabajo ot ON ot.id = ott.orden_trabajo_id
        LEFT JOIN trabajos t ON t.id = ott.trabajo_id
        LEFT JOIN categorias_trabajo ct ON ct.id = t.categoria_id
        WHERE ot.cobrado = true
          AND ot.fecha_cobrado >= make_date($1::int, 1, 1)
          AND ot.fecha_cobrado < make_date($1::int + 1, 1, 1)
        GROUP BY COALESCE(ott.categoria_nombre_snapshot, ct.nombre, 'Sin categoría')
        ORDER BY total DESC, cantidad DESC
      `,
      params
    ),
    queryRows<EstadisticaRanking>(
      `
        SELECT
          otr.repuesto_id AS id,
          COALESCE(otr.repuesto_nombre_snapshot, r.nombre, 'Repuesto eliminado') AS nombre,
          COALESCE(otr.categoria_nombre_snapshot, cr.nombre, 'Sin categoría') AS categoria,
          COALESCE(SUM(otr.cantidad), 0)::int AS cantidad,
          COALESCE(SUM(
            otr.precio_stock * otr.cantidad_stock
            + otr.precio * GREATEST(otr.cantidad - otr.cantidad_stock, 0)
          ), 0)::int AS total
        FROM orden_trabajo_repuestos otr
        INNER JOIN ordenes_trabajo ot ON ot.id = otr.orden_trabajo_id
        LEFT JOIN repuestos r ON r.id = otr.repuesto_id
        LEFT JOIN categorias_repuesto cr ON cr.id = r.categoria_id
        WHERE ot.cobrado = true
          AND ot.fecha_cobrado >= make_date($1::int, 1, 1)
          AND ot.fecha_cobrado < make_date($1::int + 1, 1, 1)
        GROUP BY
          otr.repuesto_id,
          COALESCE(otr.repuesto_nombre_snapshot, r.nombre, 'Repuesto eliminado'),
          COALESCE(otr.categoria_nombre_snapshot, cr.nombre, 'Sin categoría')
        ORDER BY cantidad DESC, total DESC
        LIMIT 8
      `,
      params
    ),
    queryRows<EstadisticaCliente>(
      `
        SELECT
          c.id,
          CONCAT(c.apellido, ', ', c.nombre) AS nombre,
          COUNT(*)::int AS cantidad,
          COALESCE(SUM(ot.monto_cobrado), 0)::int AS total
        FROM ordenes_trabajo ot
        INNER JOIN clientes c ON c.id = ot.cliente_id
        WHERE ot.estado::text = 'finalizado'
        GROUP BY c.id, c.apellido, c.nombre
        ORDER BY cantidad DESC, total DESC
        LIMIT 8
      `,
      []
    ),
    queryRows<EstadisticaComparacion>(
      `
        WITH referencia AS (
          SELECT MAX(EXTRACT(MONTH FROM fecha_cobrado)::int) AS mes
          FROM ordenes_trabajo
          WHERE cobrado = true
            AND fecha_cobrado >= make_date($1::int, 1, 1)
            AND fecha_cobrado < make_date($1::int + 1, 1, 1)
        ),
        periodos AS (
          SELECT
            r.mes,
            make_date($1::int, r.mes, 1) AS inicio_mes,
            make_date($1::int, r.mes, 1) - interval '1 month' AS inicio_anterior,
            make_date($1::int - 1, r.mes, 1) AS inicio_interanual
          FROM referencia r
          WHERE r.mes IS NOT NULL
        )
        SELECT
          p.mes AS "mesReferencia",
          COUNT(*) FILTER (
            WHERE ot.fecha_cobrado >= p.inicio_mes
              AND ot.fecha_cobrado < p.inicio_mes + interval '1 month'
          )::int AS "cantidadMes",
          COALESCE(SUM(ot.monto_cobrado) FILTER (
            WHERE ot.fecha_cobrado >= p.inicio_mes
              AND ot.fecha_cobrado < p.inicio_mes + interval '1 month'
          ), 0)::int AS "totalMes",
          COUNT(*) FILTER (
            WHERE ot.fecha_cobrado >= p.inicio_anterior
              AND ot.fecha_cobrado < p.inicio_mes
          )::int AS "cantidadMesAnterior",
          COALESCE(SUM(ot.monto_cobrado) FILTER (
            WHERE ot.fecha_cobrado >= p.inicio_anterior
              AND ot.fecha_cobrado < p.inicio_mes
          ), 0)::int AS "totalMesAnterior",
          COUNT(*) FILTER (
            WHERE ot.fecha_cobrado >= p.inicio_interanual
              AND ot.fecha_cobrado < p.inicio_interanual + interval '1 month'
          )::int AS "cantidadMismoMesAnterior",
          COALESCE(SUM(ot.monto_cobrado) FILTER (
            WHERE ot.fecha_cobrado >= p.inicio_interanual
              AND ot.fecha_cobrado < p.inicio_interanual + interval '1 month'
          ), 0)::int AS "totalMismoMesAnterior"
        FROM periodos p
        LEFT JOIN ordenes_trabajo ot
          ON ot.cobrado = true
          AND ot.fecha_cobrado >= LEAST(p.inicio_anterior, p.inicio_interanual)
          AND ot.fecha_cobrado < p.inicio_mes + interval '1 month'
        GROUP BY p.mes
      `,
      params
    ),
  ]);

  const resumen = resumenRows[0] ?? {
    creados: 0,
    aprobados: 0,
    promedio_dias_aprobacion: null,
    pendientes_cobro: 0,
    monto_pendiente: 0,
  };
  const totalCobrado = mensual.reduce((sum, row) => sum + row.totalCobrado, 0);
  const cantidadCobrada = mensual.reduce((sum, row) => sum + row.cobrados, 0);

  return {
    resumen: {
      creados: resumen.creados,
      aprobados: resumen.aprobados,
      tasaAprobacion: resumen.creados > 0
        ? Math.round((resumen.aprobados / resumen.creados) * 1000) / 10
        : 0,
      promedioDiasAprobacion: resumen.promedio_dias_aprobacion,
      pendientesCobro: resumen.pendientes_cobro,
      montoPendiente: resumen.monto_pendiente,
      ticketPromedio: cantidadCobrada > 0 ? Math.round(totalCobrado / cantidadCobrada) : 0,
    },
    mensual,
    estados,
    prioridades,
    listasPrecio,
    iva,
    trabajosSolicitados,
    ingresosCategorias,
    repuestosUtilizados,
    clientesPrincipales,
    comparacion: comparacionRows[0] ?? {
      mesReferencia: null,
      cantidadMes: 0,
      totalMes: 0,
      cantidadMesAnterior: 0,
      totalMesAnterior: 0,
      cantidadMismoMesAnterior: 0,
      totalMismoMesAnterior: 0,
    },
  };
}
