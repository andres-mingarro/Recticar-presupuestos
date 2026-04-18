import process from "node:process";
import { neon } from "@neondatabase/serverless";
import { loadDotEnvLocal } from "./lib/env.mjs";

const DEV_CLIENT_EMAIL_DOMAIN = "@dev.recticar.local";
const DEV_TRABAJO_TAG = "[DEV-SEED]";

async function main() {
  await loadDotEnvLocal();

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no está definida en el entorno ni en .env.local");
  }

  const sql = neon(process.env.DATABASE_URL);
  const trabajos = await sql`
    SELECT id
    FROM ordenes_trabajo
    WHERE observaciones ILIKE ${`${DEV_TRABAJO_TAG}%`}
  `;

  for (const trabajo of trabajos) {
    await sql`DELETE FROM orden_trabajo_trabajos WHERE orden_trabajo_id = ${trabajo.id}`;
  }

  await sql`
    DELETE FROM ordenes_trabajo
    WHERE observaciones ILIKE ${`${DEV_TRABAJO_TAG}%`}
  `;

  await sql`
    DELETE FROM clientes
    WHERE mail ILIKE ${`%${DEV_CLIENT_EMAIL_DOMAIN}`}
  `;

  console.log("Datos fake DEV-SEED eliminados correctamente.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
