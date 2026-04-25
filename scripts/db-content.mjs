import { spawnSync } from "node:child_process";
import process from "node:process";
import readline from "node:readline";
import { loadDotEnvLocal } from "./lib/env.mjs";

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function run(script) {
  const result = spawnSync("node", [script], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

async function main() {
  await loadDotEnvLocal();

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no está definida en .env.local");
  }

  console.log("\n¿Qué querés hacer?");
  console.log("  1. Crear contenido dummy");
  console.log("  2. Borrar contenido dummy");

  const opcion = await ask("\nOpción: ");

  if (opcion === "1") {
    console.log("\n¿Qué contenido querés crear?");
    console.log("  1. Datos generales (clientes + trabajos)");
    console.log("  2. Estadísticas (2 años de órdenes cobradas + ajustes de precios)");
    console.log("  3. Todo");

    const sub = await ask("\nOpción: ");

    if (sub === "1" || sub === "3") run("scripts/seed-dev-data.mjs");
    if (sub === "2" || sub === "3") run("scripts/seed-estadisticas-dev.mjs");
    if (!["1", "2", "3"].includes(sub)) {
      console.log("Opción inválida. Cancelado.");
      process.exit(1);
    }
  } else if (opcion === "2") {
    const confirm = await ask("\n⚠️  Esto borra todos los datos dummy. Escribí 'y' para confirmar: ");
    if (confirm !== "y") {
      console.log("Cancelado.");
      process.exit(0);
    }
    run("scripts/reset-dev-data.mjs");
  } else {
    console.log("Opción inválida. Cancelado.");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
