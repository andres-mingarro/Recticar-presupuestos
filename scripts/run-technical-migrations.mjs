import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { neon } from "@neondatabase/serverless";
import { loadDotEnvLocal } from "./lib/env.mjs";

function splitStatements(sqlText) {
  return sqlText
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function main() {
  await loadDotEnvLocal();

  const databaseUrl = process.env.TECHNICAL_DATABASE_URL ?? process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("TECHNICAL_DATABASE_URL (ni DATABASE_URL) están definidas en el entorno ni en .env.local");
  }

  const sql = neon(databaseUrl);
  const migrationsDir = path.join(process.cwd(), "migrations-technical");
  const migrationFiles = (await fs.readdir(migrationsDir))
    .filter((fileName) => fileName.endsWith(".sql"))
    .sort();

  await sql.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations_technical (
      id varchar(255) PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  const appliedRows = await sql.query("SELECT id FROM schema_migrations_technical");
  const applied = new Set(appliedRows.map((row) => row.id));

  for (const fileName of migrationFiles) {
    if (applied.has(fileName)) {
      console.log(`skip ${fileName}`);
      continue;
    }

    const filePath = path.join(migrationsDir, fileName);
    const contents = await fs.readFile(filePath, "utf8");
    const statements = splitStatements(contents);

    if (statements.length === 0) {
      console.log(`skip ${fileName} (sin statements)`);
      continue;
    }

    for (const statement of statements) {
      await sql.query(statement);
    }

    await sql`INSERT INTO schema_migrations_technical (id) VALUES (${fileName})`;
    console.log(`applied ${fileName}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
