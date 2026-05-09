import { neon } from "@neondatabase/serverless";
import { loadDotEnvLocal } from "./lib/env.mjs";

async function main() {
  await loadDotEnvLocal();
  const sql = neon(process.env.DATABASE_URL);

  const rows = await sql.query(`
    SELECT
      estado,
      cobrado,
      CASE
        WHEN observaciones ILIKE '%[DEV-SEED]%' THEN '[DEV-SEED]'
        WHEN observaciones ILIKE '%[DS]%' THEN '[DS]'
        ELSE 'real'
      END AS origen,
      COUNT(*) AS cantidad
    FROM ordenes_trabajo
    GROUP BY estado, cobrado, origen
    ORDER BY origen, estado
  `);

  console.log("\nÓrdenes por estado/cobrado/origen:");
  console.log("─".repeat(55));
  for (const r of rows) {
    console.log(`  ${r.origen.padEnd(12)} estado=${r.estado.padEnd(22)} cobrado=${String(r.cobrado).padEnd(5)} → ${r.cantidad}`);
  }
}

main().catch((e) => { console.error(e.message); process.exit(1); });
