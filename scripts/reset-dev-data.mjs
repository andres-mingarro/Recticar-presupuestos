import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { neon } from "@neondatabase/serverless";
import { loadDotEnvLocal } from "./lib/env.mjs";

const DEV_AJUSTES_IDS_FILE = path.join(process.cwd(), ".dev-seed-ajustes-ids.json");

const DEV_CLIENT_EMAIL_DOMAIN = "@dev.recticar.local";
const DEV_ORDEN_TAG = "[DS]";
const DEV_SEED_TAG = "[DS]";

async function main() {
  await loadDotEnvLocal();

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no está definida en el entorno ni en .env.local");
  }

  const sql = neon(process.env.DATABASE_URL);

  // 1. Órdenes de trabajo DS
  console.log("Buscando órdenes de trabajo DS...");
  const ordenes = await sql`
    SELECT id FROM ordenes_trabajo
    WHERE observaciones ILIKE ${`${DEV_ORDEN_TAG}%`}
  `;
  console.log(`  ${ordenes.length} órdenes encontradas.`);

  if (ordenes.length > 0) {
    const ids = ordenes.map((o) => o.id);
    await sql`DELETE FROM orden_trabajo_trabajos  WHERE orden_trabajo_id = ANY(${ids})`;
    await sql`DELETE FROM orden_trabajo_repuestos WHERE orden_trabajo_id = ANY(${ids})`;
    await sql`DELETE FROM ordenes_trabajo WHERE id = ANY(${ids})`;
    console.log("  Órdenes, trabajos asociados y repuestos asociados eliminados.");
  }

  // 2. Clientes DS
  await sql`DELETE FROM clientes WHERE mail ILIKE ${`%${DEV_CLIENT_EMAIL_DOMAIN}`}`;
  console.log("  Clientes eliminados.");

  // 3. Ajustes de lista de precios
  console.log("Borrando ajustes de lista de precios...");
  await sql`DELETE FROM ajustes_lista_precios`;
  await fs.unlink(DEV_AJUSTES_IDS_FILE).catch(() => null);
  console.log("  Ajustes eliminados.");

  // 4. Trabajos DS
  // Primero borrar referencias en orden_trabajo_trabajos de cualquier orden que los use
  console.log("Borrando trabajos y categorías DS...");
  const categoriasTrabajo = await sql`
    SELECT id FROM categorias_trabajo WHERE nombre ILIKE ${`${DEV_SEED_TAG}%`}
  `;
  if (categoriasTrabajo.length > 0) {
    const catIds = categoriasTrabajo.map((c) => c.id);
    const trabajosDev = await sql`
      SELECT id FROM trabajos WHERE categoria_id = ANY(${catIds})
    `;
    if (trabajosDev.length > 0) {
      const tIds = trabajosDev.map((t) => t.id);
      await sql`DELETE FROM orden_trabajo_trabajos WHERE trabajo_id = ANY(${tIds})`;
      await sql`DELETE FROM trabajos WHERE id = ANY(${tIds})`;
    }
    await sql`DELETE FROM categorias_trabajo WHERE id = ANY(${catIds})`;
    console.log(`  ${categoriasTrabajo.length} categorías y ${trabajosDev?.length ?? 0} trabajos eliminados.`);
  } else {
    console.log("  Sin categorías de trabajos DS.");
  }

  // 5. Repuestos DS
  // Primero borrar referencias en orden_trabajo_repuestos de cualquier orden que los use
  console.log("Borrando repuestos y categorías DS...");
  const categoriasRepuesto = await sql`
    SELECT id FROM categorias_repuesto WHERE nombre ILIKE ${`${DEV_SEED_TAG}%`}
  `;
  if (categoriasRepuesto.length > 0) {
    const catIds = categoriasRepuesto.map((c) => c.id);
    const repuestosDev = await sql`
      SELECT id FROM repuestos WHERE categoria_id = ANY(${catIds})
    `;
    if (repuestosDev.length > 0) {
      const rIds = repuestosDev.map((r) => r.id);
      await sql`DELETE FROM orden_trabajo_repuestos WHERE repuesto_id = ANY(${rIds})`;
      await sql`DELETE FROM repuestos WHERE id = ANY(${rIds})`;
    }
    await sql`DELETE FROM categorias_repuesto WHERE id = ANY(${catIds})`;
    console.log(`  ${categoriasRepuesto.length} categorías y ${repuestosDev?.length ?? 0} repuestos eliminados.`);
  } else {
    console.log("  Sin categorías de repuestos DS.");
  }

  console.log("\nListo. Todos los datos dummy fueron eliminados.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
