import process from "node:process";
import { neon } from "@neondatabase/serverless";
import { loadDotEnvLocal } from "./lib/env.mjs";

const DEV_CLIENT_EMAIL_DOMAIN = "@dev.recticar.local";
const DEV_PEDIDO_TAG = "[DEV-SEED]";

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

  console.log("Limpiando datos DEV-SEED previos...");

  const pedidosPrevios = await sql`
    SELECT id
    FROM pedidos
    WHERE observaciones ILIKE ${`${DEV_PEDIDO_TAG}%`}
  `;

  for (const pedido of pedidosPrevios) {
    await sql`DELETE FROM pedido_trabajos WHERE pedido_id = ${pedido.id}`;
  }

  await sql`
    DELETE FROM pedidos
    WHERE observaciones ILIKE ${`${DEV_PEDIDO_TAG}%`}
  `;

  await sql`
    DELETE FROM clientes
    WHERE mail ILIKE ${`%${DEV_CLIENT_EMAIL_DOMAIN}`}
  `;

  const combinaciones = await sql`
    SELECT
      ma.id AS marca_id,
      ma.nombre AS marca_nombre,
      mo.id AS modelo_id,
      mo.nombre AS modelo_nombre,
      mt.id AS motor_id,
      mt.nombre AS motor_nombre
    FROM modelo_motor mm
    INNER JOIN modelos mo ON mo.id = mm.modelo_id
    INNER JOIN marcas ma ON ma.id = mo.marca_id
    INNER JOIN motores mt ON mt.id = mm.motor_id
    ORDER BY ma.nombre ASC, mo.nombre ASC, mt.nombre ASC
    LIMIT 120
  `;

  const trabajos = await sql`
    SELECT id
    FROM trabajos
    ORDER BY id ASC
  `;

  if (combinaciones.length === 0) {
    throw new Error("No hay combinaciones marca/modelo/motor disponibles para sembrar pedidos.");
  }

  if (trabajos.length === 0) {
    throw new Error("No hay trabajos cargados para asociar a los pedidos de prueba.");
  }

  const clientes = [];
  const baseAlta = new Date("2026-01-15T09:00:00.000Z");

  console.log("Creando 20 clientes de desarrollo...");

  for (let index = 0; index < 20; index += 1) {
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

  console.log("Creando 40 pedidos de desarrollo...");

  const basePedido = new Date("2026-03-01T10:00:00.000Z");
  const prioridades = ["baja", "normal", "alta"];
  const estados = ["pendiente", "aprobado", "finalizado"];
  let pedidosCreados = 0;

  for (let index = 0; index < 40; index += 1) {
    const cliente = clientes[index % clientes.length];
    const combinacion = combinaciones[index % combinaciones.length];
    const estado = estados[index % estados.length];
    const prioridad = prioridades[index % prioridades.length];
    const fechaCreacion = toIso(plusDays(basePedido, index));
    const fechaAprobacion =
      estado === "aprobado" || estado === "finalizado"
        ? toIso(plusDays(basePedido, index + 2))
        : null;
    const observaciones = `${DEV_PEDIDO_TAG} Pedido demo ${index + 1} para ${cliente.apellido}, ${cliente.nombre}`;
    const serie = `DEV-${String(index + 1).padStart(4, "0")}-${combinacion.motor_id}`;

    const insertedPedido = await sql`
      INSERT INTO pedidos (
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

    const pedidoId = insertedPedido[0].id;
    const trabajosPorPedido = 2 + (index % 4);

    for (let offset = 0; offset < trabajosPorPedido; offset += 1) {
      const trabajo = trabajos[(index + offset) % trabajos.length];
      await sql`
        INSERT INTO pedido_trabajos (pedido_id, trabajo_id)
        VALUES (${pedidoId}, ${trabajo.id})
        ON CONFLICT (pedido_id, trabajo_id) DO NOTHING
      `;
    }

    pedidosCreados += 1;
  }

  console.log(`Seed completado: ${clientes.length} clientes y ${pedidosCreados} pedidos.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
