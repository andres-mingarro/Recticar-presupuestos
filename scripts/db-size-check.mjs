import { neon } from "@neondatabase/serverless";
import { loadDotEnvLocal } from "./lib/env.mjs";

async function main() {
  await loadDotEnvLocal();
  const sql = neon(process.env.DATABASE_URL);

  // Tamaño total de la base
  const [{ total }] = await sql.query(
    `SELECT pg_size_pretty(pg_database_size(current_database())) AS total`
  );
  console.log(`\nTamaño total de la base: ${total}\n`);

  // Tamaño por tabla (datos + índices)
  const tables = await sql.query(`
    SELECT
      relname AS tabla,
      pg_size_pretty(pg_total_relation_size(oid)) AS total,
      pg_size_pretty(pg_relation_size(oid)) AS datos,
      pg_size_pretty(pg_indexes_size(oid)) AS indices,
      pg_total_relation_size(oid) AS bytes
    FROM pg_class
    WHERE relkind = 'r'
      AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ORDER BY bytes DESC
  `);

  console.log("Tablas por tamaño (datos + índices):");
  console.log("─".repeat(70));
  console.log(`${"Tabla".padEnd(40)} ${"Total".padStart(10)} ${"Datos".padStart(10)} ${"Índices".padStart(10)}`);
  console.log("─".repeat(70));
  for (const row of tables) {
    console.log(`${row.tabla.padEnd(40)} ${row.total.padStart(10)} ${row.datos.padStart(10)} ${row.indices.padStart(10)}`);
  }

  // Conteo de filas
  console.log("\nConteo de filas:");
  console.log("─".repeat(40));
  for (const row of tables) {
    const [{ count }] = await sql.query(`SELECT COUNT(*) AS count FROM "${row.tabla}"`);
    console.log(`${row.tabla.padEnd(35)} ${String(count).padStart(6)} filas`);
  }

  // Índices grandes
  const indexes = await sql.query(`
    SELECT
      indexname,
      tablename,
      pg_size_pretty(pg_relation_size(indexname::regclass)) AS size,
      pg_relation_size(indexname::regclass) AS bytes
    FROM pg_indexes
    WHERE schemaname = 'public'
    ORDER BY bytes DESC
    LIMIT 20
  `);

  console.log("\nÍndices más grandes:");
  console.log("─".repeat(70));
  for (const idx of indexes) {
    console.log(`${idx.indexname.padEnd(50)} ${idx.size.padStart(10)}  (tabla: ${idx.tablename})`);
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
