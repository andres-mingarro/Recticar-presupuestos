/**
 * Genera órdenes de trabajo cobradas distribuidas en 2 años para poblar
 * la pantalla de estadísticas en dev. Todas llevan el tag DEV-SEED y se
 * pueden eliminar con npm run db:reset:dev.
 *
 * Uso: npm run db:seed:estadisticas
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { neon } from "@neondatabase/serverless";
import { loadDotEnvLocal } from "./lib/env.mjs";

const DEV_AJUSTES_IDS_FILE = path.join(process.cwd(), ".dev-seed-ajustes-ids.json");

const DEV_CLIENT_EMAIL_DOMAIN = "@dev.recticar.local";
const DEV_TRABAJO_TAG = "[DEV-SEED]";

// Cantidad de órdenes cobradas por mes (variación realista)
const ORDENES_POR_MES = [8, 6, 10, 12, 9, 14, 11, 7, 13, 10, 8, 15];

function toIso(date) {
  return date.toISOString();
}

function fechaEnMes(anio, mes, dia) {
  // mes es 1-based
  return new Date(`${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}T10:00:00.000Z`);
}

async function main() {
  await loadDotEnvLocal();

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no está definida en .env.local");
  }

  const sql = neon(process.env.DATABASE_URL);
  const technicalSql = neon(process.env.TECHNICAL_DATABASE_URL ?? process.env.DATABASE_URL);

  // Obtener combinaciones marca/modelo/motor del catálogo técnico
  const combinaciones = await technicalSql`
    SELECT
      ma.id AS marca_id,
      mo.id AS modelo_id,
      m.id AS motor_id
    FROM vehiculos v
    INNER JOIN modelos mo ON mo.id = v.modelo_id
    INNER JOIN marcas ma ON ma.id = mo.marca_id
    INNER JOIN motores m ON m.id = v.motor_id
    ORDER BY ma.nombre ASC
    LIMIT 60
  `;

  if (combinaciones.length === 0) {
    throw new Error("No hay combinaciones marca/modelo/motor en el catálogo técnico.");
  }

  const trabajos = await sql`SELECT id, precio_lista_1 FROM trabajos ORDER BY id ASC`;

  if (trabajos.length === 0) {
    throw new Error("No hay trabajos cargados en la base.");
  }

  // Reutilizar clientes DEV-SEED existentes o crear uno genérico
  let clientes = await sql`
    SELECT id FROM clientes
    WHERE mail ILIKE ${`%${DEV_CLIENT_EMAIL_DOMAIN}`}
    ORDER BY id ASC
    LIMIT 15
  `;

  if (clientes.length === 0) {
    // Crear un cliente genérico de estadísticas si no hay ninguno
    const inserted = await sql`
      INSERT INTO clientes (nombre, apellido, telefono, mail, ciudad, provincia, fecha_alta)
      VALUES ('Stats', 'Dev', '1100000000', ${"stats.dev" + DEV_CLIENT_EMAIL_DOMAIN}, 'Rawson', 'Chubut', NOW())
      RETURNING id
    `;
    clientes = inserted;
  }

  const anioActual = new Date().getFullYear();
  const anios = [anioActual - 1, anioActual];

  let total = 0;

  for (const anio of anios) {
    console.log(`\nGenerando órdenes para ${anio}...`);

    for (let mes = 1; mes <= 12; mes++) {
      const cantidad = ORDENES_POR_MES[(mes - 1) % ORDENES_POR_MES.length];

      for (let i = 0; i < cantidad; i++) {
        const dia = 1 + (i % 28);
        const cliente = clientes[i % clientes.length];
        const combinacion = combinaciones[(total + i) % combinaciones.length];
        const fecha = fechaEnMes(anio, mes, dia);
        const serie = `DEV-STATS-${anio}-${String(mes).padStart(2, "0")}-${String(i + 1).padStart(3, "0")}`;
        const observaciones = `${DEV_TRABAJO_TAG} Stats ${anio}/${mes}`;

        const inserted = await sql`
          INSERT INTO ordenes_trabajo (
            cliente_id,
            marca_id,
            modelo_id,
            motor_id,
            numero_serie_motor,
            prioridad,
            estado,
            cobrado,
            fecha_creacion,
            fecha_aprobacion,
            observaciones
          )
          VALUES (
            ${cliente.id},
            ${combinacion.marca_id},
            ${combinacion.modelo_id},
            ${combinacion.motor_id},
            ${serie},
            'normal',
            'finalizado',
            true,
            ${toIso(fecha)},
            ${toIso(fecha)},
            ${observaciones}
          )
          RETURNING id
        `;

        const ordenId = inserted[0].id;
        const trabajo = trabajos[i % trabajos.length];
        const precioSnapshot = Number(trabajo.precio_lista_1) || 15000;
        await sql`
          INSERT INTO orden_trabajo_trabajos (orden_trabajo_id, trabajo_id, precio_snapshot)
          VALUES (${ordenId}, ${trabajo.id}, ${precioSnapshot})
          ON CONFLICT DO NOTHING
        `;
      }

      console.log(`  ${anio}/${String(mes).padStart(2, "0")} — ${cantidad} órdenes`);
      total += cantidad;
    }
  }

  console.log(`\nSeed de estadísticas completado: ${total} órdenes cobradas en ${anios.join(" y ")}.`);

  // Ajustes de lista de precios — 2 ajustes por mes en cada año
  const categorias = await sql`SELECT id, nombre FROM categorias_trabajo ORDER BY id ASC`;

  if (categorias.length === 0) {
    console.log("\nNo hay categorías de trabajo — se omiten los ajustes de lista de precios.");
    return;
  }

  console.log("\nGenerando ajustes de lista de precios...");
  let totalAjustes = 0;
  const ajustesIds = [];

  // Un ajuste por mes, entre 0 y 3%
  const variaciones = [
    [1.0, 1.5, 0.5],
    [0.0, 0.5, 0.0],
    [2.0, 2.5, 1.5],
    [1.0, 1.0, 1.0],
    [0.5, 1.0, 0.5],
    [1.5, 2.0, 1.0],
    [0.0, 0.0, 0.0],
    [1.0, 1.5, 1.0],
    [2.0, 2.0, 1.5],
    [0.5, 1.0, 0.5],
    [1.0, 1.5, 0.5],
    [1.5, 2.0, 1.0],
  ];

  const mesActual = new Date().getMonth() + 1;

  for (const anio of anios) {
    const mesLimite = anio === anioActual ? mesActual : 12;
    for (let mes = 1; mes <= mesLimite; mes++) {
      const fecha = fechaEnMes(anio, mes, 10);
      const v = variaciones[(mes - 1) % variaciones.length];

      for (const categoria of categorias) {
        if (v[0] === 0 && v[1] === 0 && v[2] === 0) continue;
        const inserted = await sql`
          INSERT INTO ajustes_lista_precios
            (fecha, categoria_id, categoria_nombre, ajuste_lista_1, ajuste_lista_2, ajuste_lista_3)
          VALUES (
            ${toIso(fecha)},
            ${categoria.id},
            ${categoria.nombre},
            ${v[0]},
            ${v[1]},
            ${v[2]}
          )
          RETURNING id
        `;
        ajustesIds.push(inserted[0].id);
        totalAjustes++;
      }
    }
  }

  await fs.writeFile(DEV_AJUSTES_IDS_FILE, JSON.stringify(ajustesIds), "utf8");
  console.log(`Ajustes de lista de precios: ${totalAjustes} registros generados.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
