import process from "node:process";
import { neon } from "@neondatabase/serverless";
import { loadDotEnvLocal } from "./lib/env.mjs";

const DEV_CLIENT_EMAIL_DOMAIN = "@dev.recticar.local";
const DEV_TRABAJO_TAG = "[DEV-SEED]";
const DEV_CLIENTS_COUNT = 15;
const DEV_TRABAJOS_COUNT = 15;

const nombres = [
  "Andres",
  "Juan",
  "Carlos",
  "Martin",
  "Lucas",
  "Nicolas",
  "Fernando",
  "Diego",
  "Sergio",
  "Pablo",
  "Ramon",
  "Matias",
  "Hernan",
  "Ezequiel",
  "Leandro",
  "Mariano",
  "Facundo",
  "Javier",
  "Cristian",
  "Adrian",
];

const apellidos = [
  "Mingarro",
  "Perez",
  "Gomez",
  "Suarez",
  "Lopez",
  "Martinez",
  "Diaz",
  "Romero",
  "Alvarez",
  "Benitez",
  "Torres",
  "Sosa",
  "Acosta",
  "Medina",
  "Castro",
  "Ruiz",
  "Molina",
  "Rojas",
  "Nuñez",
  "Silva",
];

const calles = [
  "Alvear",
  "Belgrano",
  "San Martin",
  "Mitre",
  "Saavedra",
  "Lavalle",
  "Rivadavia",
  "Moreno",
  "Urquiza",
  "Sarmiento",
];

const ciudades = [
  "Cordoba",
  "Rosario",
  "Mendoza",
  "La Plata",
  "Mar del Plata",
  "Santa Fe",
  "San Miguel de Tucuman",
  "Salta",
  "Neuquen",
  "Rio Cuarto",
];

const provincias = [
  "Cordoba",
  "Santa Fe",
  "Mendoza",
  "Buenos Aires",
  "Buenos Aires",
  "Santa Fe",
  "Tucuman",
  "Salta",
  "Neuquen",
  "Cordoba",
];

const cps = [
  "9100",
  "2000",
  "5500",
  "1900",
  "7600",
  "3000",
  "4000",
  "4400",
  "8300",
  "5800",
];

function plusDays(baseDate, days) {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + days);
  return date;
}

function toIso(value) {
  return value.toISOString();
}

async function main() {
  await loadDotEnvLocal();

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no está definida en el entorno ni en .env.local");
  }

  const sql = neon(process.env.DATABASE_URL);
  const technicalSql = neon(process.env.TECHNICAL_DATABASE_URL ?? process.env.DATABASE_URL);

  console.log("Limpiando datos DEV-SEED previos...");

  const trabajosPrevios = await sql`
    SELECT id
    FROM ordenes_trabajo
    WHERE observaciones ILIKE ${`${DEV_TRABAJO_TAG}%`}
  `;

  for (const trabajo of trabajosPrevios) {
    await sql`DELETE FROM orden_trabajo_trabajos WHERE orden_trabajo_id = ${trabajo.id}`;
  }

  await sql`
    DELETE FROM ordenes_trabajo
    WHERE observaciones ILIKE ${`${DEV_TRABAJO_TAG}%`}
  `;

  await sql`
    DELETE FROM clientes
    WHERE mail ILIKE ${`%${DEV_CLIENT_EMAIL_DOMAIN}`}
  `;

  const combinaciones = await technicalSql`
    SELECT
      ma.id AS marca_id,
      ma.nombre AS marca_nombre,
      mo.id AS modelo_id,
      mo.nombre AS modelo_nombre,
      m.id AS motor_id,
      m.nombre AS motor_nombre
    FROM vehiculos v
    INNER JOIN modelos mo ON mo.id = v.modelo_id
    INNER JOIN marcas ma ON ma.id = mo.marca_id
    INNER JOIN motores m ON m.id = v.motor_id
    ORDER BY ma.nombre ASC, mo.nombre ASC, m.nombre ASC
    LIMIT 120
  `;

  const trabajos = await sql`
    SELECT id
    FROM trabajos
    ORDER BY id ASC
  `;

  if (combinaciones.length === 0) {
    throw new Error("No hay combinaciones marca/modelo/motor disponibles para sembrar trabajos.");
  }

  if (trabajos.length === 0) {
    throw new Error("No hay trabajos cargados para asociar a los trabajos de prueba.");
  }

  const clientes = [];
  const baseAlta = new Date("2026-01-15T09:00:00.000Z");

  console.log(`Creando ${DEV_CLIENTS_COUNT} clientes de desarrollo...`);

  for (let index = 0; index < DEV_CLIENTS_COUNT; index += 1) {
    const nombre = nombres[index % nombres.length];
    const apellido = apellidos[index % apellidos.length];
    const direccion = `${calles[index % calles.length]} ${120 + index * 17}`;
    const ciudad = ciudades[index % ciudades.length];
    const provincia = provincias[index % provincias.length];
    const cp = cps[index % cps.length];
    const telefono = `11${String(32000000 + index * 731).padStart(8, "0")}`;
    const mail = `${nombre.toLowerCase()}.${apellido.toLowerCase()}.${index + 1}${DEV_CLIENT_EMAIL_DOMAIN}`;
    const fechaAlta = toIso(plusDays(baseAlta, index));

    const inserted = await sql`
      INSERT INTO clientes (nombre, apellido, telefono, mail, ciudad, direccion, provincia, cp, fecha_alta)
      VALUES (${nombre}, ${apellido}, ${telefono}, ${mail}, ${ciudad}, ${direccion}, ${provincia}, ${cp}, ${fechaAlta})
      RETURNING id, numero_cliente, nombre, apellido
    `;

    clientes.push(inserted[0]);
  }

  console.log(`Creando ${DEV_TRABAJOS_COUNT} trabajos de desarrollo...`);

  const baseTrabajo = new Date("2026-03-01T10:00:00.000Z");
  const prioridades = ["baja", "normal", "alta"];
  const estados = ["pendiente", "aprobado", "finalizado"];
  let trabajosCreados = 0;

  for (let index = 0; index < DEV_TRABAJOS_COUNT; index += 1) {
    const cliente = clientes[index % clientes.length];
    const combinacion = combinaciones[index % combinaciones.length];
    const estado = estados[index % estados.length];
    const prioridad = prioridades[index % prioridades.length];
    const fechaCreacion = toIso(plusDays(baseTrabajo, index));
    const fechaAprobacion =
      estado === "aprobado" || estado === "finalizado"
        ? toIso(plusDays(baseTrabajo, index + 2))
        : null;
    const observaciones = `${DEV_TRABAJO_TAG} Trabajo demo ${index + 1} para ${cliente.apellido}, ${cliente.nombre}`;
    const serie = `DEV-${String(index + 1).padStart(4, "0")}-${combinacion.motor_id}`;

    const insertedTrabajo = await sql`
      INSERT INTO ordenes_trabajo (
        cliente_id,
        marca_id,
        modelo_id,
        motor_id,
        numero_serie_motor,
        prioridad,
        estado,
        fecha_creacion,
        fecha_aprobacion,
        observaciones
      )
      VALUES (
        ${cliente.id},
        ${combinacion.marca_id},
        ${combinacion.modelo_id},
        ${combinacion.motor_id},
        ${serie},
        ${prioridad},
        ${estado},
        ${fechaCreacion},
        ${fechaAprobacion},
        ${observaciones}
      )
      RETURNING id
    `;

    const trabajoId = insertedTrabajo[0].id;
    const trabajosPorTrabajo = 2 + (index % 4);

    for (let offset = 0; offset < trabajosPorTrabajo; offset += 1) {
      const trabajo = trabajos[(index + offset) % trabajos.length];
      await sql`
        INSERT INTO orden_trabajo_trabajos (orden_trabajo_id, trabajo_id)
        VALUES (${trabajoId}, ${trabajo.id})
        ON CONFLICT (orden_trabajo_id, trabajo_id) DO NOTHING
      `;
    }

    trabajosCreados += 1;
  }

  console.log(`Seed completado: ${clientes.length} clientes y ${trabajosCreados} trabajos.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
