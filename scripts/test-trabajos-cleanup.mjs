/**
 * Prueba manual end-to-end para la limpieza de trabajos vencidos.
 *
 * Que hace:
 * - toma un trabajo existente por id
 * - fuerza la configuracion de limpieza automatica
 * - envejece `fecha_presupuesto_entregado` a una fecha configurable
 * - ejecuta la misma logica SQL de limpieza que usa el sistema
 * - verifica si se borro el trabajo padre y si quedaron hijos colgados
 *
 * Como se usa:
 * - `node scripts/test-trabajos-cleanup.mjs --id=39`
 * - `node scripts/test-trabajos-cleanup.mjs --id=39 --date=2025-12-01T00:00:00Z`
 * - `node scripts/test-trabajos-cleanup.mjs --id=39 --months=3 --note=\"TEST LIMPIEZA AUTO\"`
 *
 * Parametros:
 * - `--id`: id del trabajo a usar para la prueba. Obligatorio.
 * - `--date`: fecha vieja para forzar vencimiento. Default: `2025-12-01T00:00:00Z`
 * - `--months`: meses de retencion a configurar para la prueba. Default: `3`
 * - `--note`: texto de observaciones para identificar el trabajo de prueba.
 * - `--help`: muestra esta ayuda.
 *
 * Importante:
 * - toca datos reales de la base configurada en `DATABASE_URL`
 * - borra fisicamente el trabajo si entra en la limpieza
 */

import { neon } from "@neondatabase/serverless";
import { loadDotEnvLocal } from "./lib/env.mjs";

function printHelp() {
  console.log(`
Uso:
  node scripts/test-trabajos-cleanup.mjs --id=39
  node scripts/test-trabajos-cleanup.mjs --id=39 --date=2025-12-01T00:00:00Z
  node scripts/test-trabajos-cleanup.mjs --id=39 --months=3 --note="TEST LIMPIEZA AUTO"

Parametros:
  --id       Id del trabajo a preparar y probar. Obligatorio.
  --date     Fecha vieja para fecha_presupuesto_entregado.
  --months   Meses de retencion para la prueba.
  --note     Observacion para identificar el trabajo.
  --help     Muestra esta ayuda.
`);
}

function parseArgs(argv) {
  const options = {
    id: null,
    date: "2025-12-01T00:00:00Z",
    months: 3,
    note: "TEST LIMPIEZA AUTO",
    help: false,
  };

  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }

    if (arg.startsWith("--id=")) {
      options.id = Number(arg.slice("--id=".length));
      continue;
    }

    if (arg.startsWith("--date=")) {
      options.date = arg.slice("--date=".length);
      continue;
    }

    if (arg.startsWith("--months=")) {
      options.months = Math.max(1, Number(arg.slice("--months=".length)) || 3);
      continue;
    }

    if (arg.startsWith("--note=")) {
      options.note = arg.slice("--note=".length);
    }
  }

  return options;
}

const options = parseArgs(process.argv.slice(2));

if (options.help) {
  printHelp();
  process.exit(0);
}

if (!Number.isInteger(options.id) || Number(options.id) <= 0) {
  console.error("Falta `--id=<trabajoId>` o el valor no es valido.");
  printHelp();
  process.exit(1);
}

await loadDotEnvLocal();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL no esta definida.");
}

const sql = neon(process.env.DATABASE_URL);
const trabajoId = Number(options.id);

async function getTrabajoSnapshot(id) {
  const rows = await sql.query(
    `
      select
        id,
        numero_trabajo,
        estado,
        cobrado,
        fecha_presupuesto_entregado,
        observaciones,
        (select count(*)::int from orden_trabajo_trabajos where orden_trabajo_id = ordenes_trabajo.id) as hijos_trabajos,
        (select count(*)::int from orden_trabajo_repuestos where orden_trabajo_id = ordenes_trabajo.id) as hijos_repuestos
      from ordenes_trabajo
      where id = $1
    `,
    [id]
  );

  return rows[0] ?? null;
}

const before = await getTrabajoSnapshot(trabajoId);

if (!before) {
  console.error(`Trabajo ${trabajoId} no encontrado.`);
  process.exit(1);
}

await sql.query(
  `
    update empresa_configuracion
    set auto_eliminar_presupuestos_entregados = true,
        meses_retencion_presupuesto_entregado = $1
    where id = 1
  `,
  [options.months]
);

await sql.query(
  `
    update ordenes_trabajo
    set estado = 'presupuesto_entregado'::orden_trabajo_estado,
        cobrado = false,
        fecha_presupuesto_entregado = $2::timestamptz,
        observaciones = $3
    where id = $1
  `,
  [trabajoId, options.date, options.note]
);

const preparedRows = await sql.query(
  `
    select
      now() as ahora,
      now() - make_interval(months => $2::int) as limite,
      id,
      numero_trabajo,
      estado,
      cobrado,
      fecha_presupuesto_entregado,
      observaciones,
      (fecha_presupuesto_entregado < now() - make_interval(months => $2::int)) as vence,
      (select count(*)::int from orden_trabajo_trabajos where orden_trabajo_id = ordenes_trabajo.id) as hijos_trabajos,
      (select count(*)::int from orden_trabajo_repuestos where orden_trabajo_id = ordenes_trabajo.id) as hijos_repuestos
    from ordenes_trabajo
    where id = $1
  `,
  [trabajoId, options.months]
);

const prepared = preparedRows[0] ?? null;

const cleanupRows = await sql.query(
  `
    with target as (
      select id
      from ordenes_trabajo
      where estado = 'presupuesto_entregado'::orden_trabajo_estado
        and cobrado = false
        and fecha_presupuesto_entregado is not null
        and fecha_presupuesto_entregado < now() - make_interval(months => $1::int)
    ),
    del_trabajos as (
      delete from orden_trabajo_trabajos
      where orden_trabajo_id in (select id from target)
    ),
    del_repuestos as (
      delete from orden_trabajo_repuestos
      where orden_trabajo_id in (select id from target)
    ),
    del_ordenes as (
      delete from ordenes_trabajo
      where id in (select id from target)
      returning id
    )
    select
      count(*)::int as deleted_count,
      coalesce(array_agg(id order by id), '{}') as deleted_ids
    from del_ordenes
  `,
  [options.months]
);

const cleanup = cleanupRows[0] ?? { deleted_count: 0, deleted_ids: [] };

await sql.query(
  `
    update empresa_configuracion
    set ultima_ejecucion_limpieza = now()
    where id = 1
  `
);

const afterRows = await sql.query(
  `
    select
      (select count(*)::int from ordenes_trabajo where id = $1) as padre,
      (select count(*)::int from orden_trabajo_trabajos where orden_trabajo_id = $1) as hijos_trabajos,
      (select count(*)::int from orden_trabajo_repuestos where orden_trabajo_id = $1) as hijos_repuestos,
      (select ultima_ejecucion_limpieza from empresa_configuracion where id = 1) as ultima_ejecucion_limpieza
  `,
  [trabajoId]
);

const after = afterRows[0] ?? null;

console.log(
  JSON.stringify(
    {
      params: {
        trabajoId,
        date: options.date,
        months: options.months,
        note: options.note,
      },
      before,
      prepared,
      cleanup,
      after,
    },
    null,
    2
  )
);
