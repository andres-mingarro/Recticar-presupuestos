import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import readline from "node:readline";
import { neon } from "@neondatabase/serverless";
import { loadDotEnvLocal } from "./lib/env.mjs";

function splitStatements(sqlText) {
  return sqlText
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function runMigrations(databaseUrl, entorno) {
  console.log(`\nAplicando migraciones en ${entorno}...\n`);

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

  let count = 0;
  for (const fileName of migrationFiles) {
    if (applied.has(fileName)) {
      console.log(`  skip     ${fileName}`);
      continue;
    }

    const filePath = path.join(migrationsDir, fileName);
    const contents = await fs.readFile(filePath, "utf8");
    const statements = splitStatements(contents);

    if (statements.length === 0) {
      console.log(`  skip     ${fileName} (sin statements)`);
      continue;
    }

    for (const statement of statements) {
      await sql.query(statement);
    }

    await sql`INSERT INTO schema_migrations (id) VALUES (${fileName})`;
    console.log(`  applied  ${fileName}`);
    count++;
  }

  if (count === 0) {
    console.log("\nNo hay migraciones nuevas.");
  } else {
    console.log(`\n${count} migración(es) aplicada(s) en ${entorno}.`);
  }
}

async function main() {
  await loadDotEnvLocal();

  console.log("\n¿A cuál entorno?");
  console.log("  1. dev");
  console.log("  2. prod");

  const opcion = await ask("\nOpción: ");

  if (opcion === "1") {
    const url = process.env.DEV_DATABASE_URL;
    if (!url) throw new Error("DEV_DATABASE_URL no está definida en .env.local");
    await runMigrations(url, "dev");
  } else if (opcion === "2") {
    const url = process.env.PROD_DATABASE_URL;
    if (!url) throw new Error("PROD_DATABASE_URL no está definida en .env.local");

    const confirm = await ask(
      "\n⚠️  Vas a migrar PRODUCCIÓN. Escribí 'prod' para confirmar: "
    );
    if (confirm !== "prod") {
      console.log("Cancelado.");
      process.exit(0);
    }

    await runMigrations(url, "prod");
  } else {
    console.log("Opción inválida. Cancelado.");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
