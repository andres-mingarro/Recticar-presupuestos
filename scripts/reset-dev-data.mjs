import process from "node:process";
import { neon } from "@neondatabase/serverless";
import { loadDotEnvLocal } from "./lib/env.mjs";

async function main() {
  await loadDotEnvLocal();

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no está definida en el entorno ni en .env.local");
  }

  const sql = neon(process.env.DATABASE_URL);
  await sql.query(`
    TRUNCATE TABLE
      pedido_trabajos,
      pedidos,
      clientes,
      modelo_motor,
      modelos,
      motores,
      marcas
    RESTART IDENTITY CASCADE
  `);

  console.log("Base principal limpiada para desarrollo: pedidos, clientes y catálogo técnico local.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
