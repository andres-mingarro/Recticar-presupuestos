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
  return runMigrationSet({
    databaseUrl,
    entorno,
    label: "base principal",
    migrationsDirName: "migrations",
    schemaTable: "schema_migrations",
  });
}

async function runTechnicalMigrations(databaseUrl, entorno) {
  return runMigrationSet({
    databaseUrl,
    entorno,
    label: "base técnica",
    migrationsDirName: "migrations-technical",
    schemaTable: "schema_migrations_technical",
  });
}

async function runMigrationSet({
  databaseUrl,
  entorno,
  label,
  migrationsDirName,
  schemaTable,
}) {
  console.log(`\nAplicando migraciones de ${label} en ${entorno}...\n`);

  const sql = neon(databaseUrl);
  const migrationsDir = path.join(process.cwd(), migrationsDirName);
  const migrationFiles = (await fs.readdir(migrationsDir))
    .filter((fileName) => fileName.endsWith(".sql"))
    .sort();

  await sql.query(`
    CREATE TABLE IF NOT EXISTS ${schemaTable} (
      id varchar(255) PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  const appliedRows = await sql.query(`SELECT id FROM ${schemaTable}`);
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

    await sql.query(`INSERT INTO ${schemaTable} (id) VALUES ($1)`, [fileName]);
    console.log(`  applied  ${fileName}`);
    count++;
  }

  if (count === 0) {
    console.log("\nNo hay migraciones nuevas.");
  } else {
    console.log(`\n${count} migración(es) aplicada(s) en ${entorno} para ${label}.`);
  }
}

async function confirmProd(kind) {
  const confirm = await ask(
    `\n⚠️  Vas a migrar ${kind} en PRODUCCIÓN. Escribí 'prod' para confirmar: `
  );

  if (confirm !== "prod") {
    console.log("Cancelado.");
    process.exit(0);
  }
}

async function askTargetMenu() {
  console.log("\n¿Qué base querés migrar?");
  console.log("  1. Principal");
  console.log("  2. Técnica");
  console.log("  0. Salir");
  return ask("\nOpción: ");
}

async function askEnvironmentMenu(label) {
  console.log(`\n${label}: elegí entorno`);
  console.log("  1. dev");
  console.log("  2. prod");
  console.log("  9. Volver");
  console.log("  0. Salir");
  return ask("\nOpción: ");
}

async function main() {
  await loadDotEnvLocal();

  while (true) {
    const targetOption = await askTargetMenu();

    if (targetOption === "0") {
      console.log("Saliendo.");
      process.exit(0);
    }

    if (targetOption === "1") {
      while (true) {
        const envOption = await askEnvironmentMenu("Base principal");

        if (envOption === "0") {
          console.log("Saliendo.");
          process.exit(0);
        }

        if (envOption === "9") {
          break;
        }

        if (envOption === "1") {
          const url = process.env.DEV_DATABASE_URL;
          if (!url) throw new Error("DEV_DATABASE_URL no está definida en .env.local");
          await runMigrations(url, "dev");
          return;
        }

        if (envOption === "2") {
          const url = process.env.PROD_DATABASE_URL;
          if (!url) throw new Error("PROD_DATABASE_URL no está definida en .env.local");
          await confirmProd("la base principal");
          await runMigrations(url, "prod");
          return;
        }

        console.log("Opción inválida.");
      }

      continue;
    }

    if (targetOption === "2") {
      while (true) {
        const envOption = await askEnvironmentMenu("Base técnica");

        if (envOption === "0") {
          console.log("Saliendo.");
          process.exit(0);
        }

        if (envOption === "9") {
          break;
        }

        if (envOption === "1") {
          const url = process.env.DEV_TECHNICAL_DATABASE_URL ?? process.env.DEV_DATABASE_URL;
          if (!url) {
            throw new Error(
              "DEV_TECHNICAL_DATABASE_URL no está definida en .env.local y tampoco hay fallback a DEV_DATABASE_URL"
            );
          }
          await runTechnicalMigrations(url, "dev");
          return;
        }

        if (envOption === "2") {
          const url = process.env.PROD_TECHNICAL_DATABASE_URL ?? process.env.PROD_DATABASE_URL;
          if (!url) {
            throw new Error(
              "PROD_TECHNICAL_DATABASE_URL no está definida en .env.local y tampoco hay fallback a PROD_DATABASE_URL"
            );
          }
          await confirmProd("la base técnica");
          await runTechnicalMigrations(url, "prod");
          return;
        }

        console.log("Opción inválida.");
      }

      continue;
    }

    console.log("Opción inválida.");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
