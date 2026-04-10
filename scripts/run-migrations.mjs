import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { neon } from "@neondatabase/serverless";

function loadDotEnvLocal() {
  if (process.env.DATABASE_URL) {
    return Promise.resolve();
  }

  const envPath = path.join(process.cwd(), ".env.local");

  return fs.readFile(envPath, "utf8").then((contents) => {
    for (const rawLine of contents.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) {
        continue;
      }

      const separatorIndex = line.indexOf("=");
      if (separatorIndex === -1) {
        continue;
      }

      const key = line.slice(0, separatorIndex).trim();
      let value = line.slice(separatorIndex + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  }).catch(() => undefined);
}

function splitStatements(sqlText) {
  return sqlText
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function main() {
  await loadDotEnvLocal();

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL no está definida en el entorno ni en .env.local");
  }

  const sql = neon(databaseUrl);
  const migrationsDir = path.join(process.cwd(), "migrations");
  const migrationFiles = (await fs.readdir(migrationsDir))
    .filter((fileName) => fileName.endsWith(".sql"))
    .sort();

  await sql.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id varchar(255) PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  const appliedRows = await sql.query("SELECT id FROM schema_migrations");
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

    await sql`INSERT INTO schema_migrations (id) VALUES (${fileName})`;
    console.log(`applied ${fileName}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
