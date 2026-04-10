import process from "node:process";
import { neon } from "@neondatabase/serverless";
import { loadDotEnvLocal } from "./lib/env.mjs";

const DEV_CLIENT_EMAIL_DOMAIN = "@dev.recticar.local";
const DEV_PEDIDO_TAG = "[DEV-SEED]";

async function main() {
  await loadDotEnvLocal();

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no está definida en el entorno ni en .env.local");
  }

  const sql = neon(process.env.DATABASE_URL);

  const pedidos = await sql`
    SELECT id
    FROM pedidos
    WHERE observaciones ILIKE ${`${DEV_PEDIDO_TAG}%`}
  `;

  for (const pedido of pedidos) {
    await sql`DELETE FROM pedido_trabajos WHERE pedido_id = ${pedido.id}`;
  }

  await sql`
    DELETE FROM pedidos
    WHERE observaciones ILIKE ${`${DEV_PEDIDO_TAG}%`}
  `;

  await sql`
    DELETE FROM clientes
    WHERE mail ILIKE ${`%${DEV_CLIENT_EMAIL_DOMAIN}`}
  `;

  console.log("Datos DEV-SEED eliminados correctamente.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
