import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { neon } from "@neondatabase/serverless";
import { loadDotEnvLocal } from "./lib/env.mjs";

const DEV_AJUSTES_IDS_FILE = path.join(process.cwd(), ".dev-seed-ajustes-ids.json");

const DEV_CLIENT_EMAIL_DOMAIN = "@dev.recticar.local";
const DEV_TRABAJO_TAG = "[DEV-SEED]";

async function main() {
  await loadDotEnvLocal();

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no está definida en el entorno ni en .env.local");
  }

  const sql = neon(process.env.DATABASE_URL);

  console.log("Buscando órdenes de trabajo DEV-SEED...");
  const trabajos = await sql`
    SELECT id
    FROM ordenes_trabajo
    WHERE observaciones ILIKE ${`${DEV_TRABAJO_TAG}%`}
  `;
  console.log(`  ${trabajos.length} órdenes encontradas.`);

  const ids = trabajos.map((t) => t.id);
  await sql`DELETE FROM orden_trabajo_trabajos WHERE orden_trabajo_id = ANY(${ids})`;
  console.log("  Items de órdenes eliminados.");

  await sql`DELETE FROM ordenes_trabajo WHERE observaciones ILIKE ${`${DEV_TRABAJO_TAG}%`}`;
  console.log("  Órdenes eliminadas.");

  await sql`DELETE FROM clientes WHERE mail ILIKE ${`%${DEV_CLIENT_EMAIL_DOMAIN}`}`;
  console.log("  Clientes eliminados.");

  console.log("Borrando ajustes de lista de precios...");
  await sql`DELETE FROM ajustes_lista_precios`;
  await fs.unlink(DEV_AJUSTES_IDS_FILE).catch(() => null);
  console.log("  Ajustes eliminados.");

  console.log("\nListo. Todos los datos dummy fueron eliminados.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
