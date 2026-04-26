import process from "node:process";
import { neon } from "@neondatabase/serverless";
import { loadDotEnvLocal } from "./lib/env.mjs";

const DEV_CLIENT_EMAIL_DOMAIN = "@dev.recticar.local";
const DEV_TRABAJO_TAG = "[DS]";
const DEV_SEED_TAG = "[DS]";
const DEV_CLIENTS_COUNT = 15;
const DEV_ORDENES_COUNT = 15;

const nombres = [
  "Andres", "Juan", "Carlos", "Martin", "Lucas",
  "Nicolas", "Fernando", "Diego", "Sergio", "Pablo",
  "Ramon", "Matias", "Hernan", "Ezequiel", "Leandro",
  "Mariano", "Facundo", "Javier", "Cristian", "Adrian",
];

const apellidos = [
  "Mingarro", "Perez", "Gomez", "Suarez", "Lopez",
  "Martinez", "Diaz", "Romero", "Alvarez", "Benitez",
  "Torres", "Sosa", "Acosta", "Medina", "Castro",
  "Ruiz", "Molina", "Rojas", "Nuñez", "Silva",
];

const calles = [
  "Alvear", "Belgrano", "San Martin", "Mitre", "Saavedra",
  "Lavalle", "Rivadavia", "Moreno", "Urquiza", "Sarmiento",
];

const ciudades = [
  "Cordoba", "Rosario", "Mendoza", "La Plata", "Mar del Plata",
  "Santa Fe", "San Miguel de Tucuman", "Salta", "Neuquen", "Rio Cuarto",
];

const provincias = [
  "Cordoba", "Santa Fe", "Mendoza", "Buenos Aires", "Buenos Aires",
  "Santa Fe", "Tucuman", "Salta", "Neuquen", "Cordoba",
];

const cps = [
  "9100", "2000", "5500", "1900", "7600",
  "3000", "4000", "4400", "8300", "5800",
];

// ---------------------------------------------------------------------------
// Catálogo dummy de trabajos: 3 secciones con sus precios en las 5 listas
// ---------------------------------------------------------------------------
const CATEGORIAS_TRABAJO = [
  {
    nombre: `${DEV_SEED_TAG} Rectificación de Cigüeñal`,
    icono: "gear",
    trabajos: [
      {
        nombre: "Rectificado de cigüeñal hasta 0.25",
        // lista1 es el precio base, las demás con escalonado realista
        lista1: 45000, lista2: 52000, lista3: 60000, lista4: 70000, lista5: 82000,
      },
      {
        nombre: "Rectificado de cigüeñal hasta 0.50",
        lista1: 52000, lista2: 60000, lista3: 69000, lista4: 80000, lista5: 94000,
      },
      {
        nombre: "Alineado de cigüeñal",
        lista1: 38000, lista2: 44000, lista3: 51000, lista4: 59000, lista5: 69000,
      },
      {
        nombre: "Cambio de cojinetes de bancada",
        lista1: 28000, lista2: 32000, lista3: 37000, lista4: 43000, lista5: 50000,
      },
    ],
  },
  {
    nombre: `${DEV_SEED_TAG} Rectificación de Cabeza`,
    icono: "wrench",
    trabajos: [
      {
        nombre: "Planeado de tapa de cilindros",
        lista1: 35000, lista2: 40000, lista3: 46000, lista4: 54000, lista5: 63000,
      },
      {
        nombre: "Armado y desarmado de cabeza",
        lista1: 42000, lista2: 48000, lista3: 55000, lista4: 64000, lista5: 75000,
      },
      {
        nombre: "Rectificado de asiento de válvulas",
        lista1: 18000, lista2: 21000, lista3: 24000, lista4: 28000, lista5: 33000,
      },
      {
        nombre: "Cambio de guías de válvulas",
        lista1: 22000, lista2: 25000, lista3: 29000, lista4: 34000, lista5: 40000,
      },
      {
        nombre: "Prueba hidráulica de cabeza",
        lista1: 15000, lista2: 17000, lista3: 20000, lista4: 23000, lista5: 27000,
      },
    ],
  },
  {
    nombre: `${DEV_SEED_TAG} Rectificación de Block`,
    icono: "cog",
    trabajos: [
      {
        nombre: "Mandrinado de cilindros",
        lista1: 55000, lista2: 63000, lista3: 73000, lista4: 85000, lista5: 99000,
      },
      {
        nombre: "Honado de cilindros",
        lista1: 30000, lista2: 34000, lista3: 39000, lista4: 46000, lista5: 54000,
      },
      {
        nombre: "Planeado de block",
        lista1: 40000, lista2: 46000, lista3: 53000, lista4: 62000, lista5: 72000,
      },
      {
        nombre: "Cambio de camisas",
        lista1: 48000, lista2: 55000, lista3: 63000, lista4: 74000, lista5: 86000,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Catálogo dummy de repuestos: algunos con stock, otros sin stock
// ---------------------------------------------------------------------------
const CATEGORIAS_REPUESTO = [
  {
    nombre: `${DEV_SEED_TAG} Juntas y Retenes`,
    repuestos: [
      { nombre: "Junta de tapa de cilindros Ford 1.6", precio: 8500, precio_stock: 7200, stock_habilitado: true, stock_cantidad: 3 },
      { nombre: "Junta de tapa de cilindros Peugeot 1.9", precio: 9200, precio_stock: 7800, stock_habilitado: true, stock_cantidad: 5 },
      { nombre: "Retén de cigüeñal delantero universal", precio: 2800, precio_stock: 2400, stock_habilitado: true, stock_cantidad: 8 },
      { nombre: "Retén de cigüeñal trasero universal", precio: 3100, precio_stock: 2600, stock_habilitado: true, stock_cantidad: 6 },
      { nombre: "Kit de juntas completo Fiat 1.4", precio: 18500, precio_stock: 0, stock_habilitado: false, stock_cantidad: 0 },
      { nombre: "Kit de juntas completo Renault 1.6", precio: 22000, precio_stock: 0, stock_habilitado: false, stock_cantidad: 0 },
    ],
  },
  {
    nombre: `${DEV_SEED_TAG} Cojinetes y Casquetes`,
    repuestos: [
      { nombre: "Cojinetes de bancada STD Volkswagen", precio: 12000, precio_stock: 10500, stock_habilitado: true, stock_cantidad: 4 },
      { nombre: "Cojinetes de bancada 0.25 Volkswagen", precio: 13500, precio_stock: 11800, stock_habilitado: true, stock_cantidad: 2 },
      { nombre: "Cojinetes de biela STD Ford", precio: 10800, precio_stock: 9300, stock_habilitado: true, stock_cantidad: 6 },
      { nombre: "Cojinetes de biela 0.25 Ford", precio: 11900, precio_stock: 10200, stock_habilitado: true, stock_cantidad: 3 },
      { nombre: "Casquetes de empuje STD Peugeot", precio: 6500, precio_stock: 0, stock_habilitado: false, stock_cantidad: 0 },
      { nombre: "Casquetes de empuje 0.25 Renault", precio: 7200, precio_stock: 0, stock_habilitado: false, stock_cantidad: 0 },
    ],
  },
  {
    nombre: `${DEV_SEED_TAG} Válvulas y Resortes`,
    repuestos: [
      { nombre: "Válvula de admisión 37mm universal", precio: 4200, precio_stock: 3800, stock_habilitado: true, stock_cantidad: 10 },
      { nombre: "Válvula de escape 33mm universal", precio: 4800, precio_stock: 4200, stock_habilitado: true, stock_cantidad: 8 },
      { nombre: "Resorte de válvula simple Fiat", precio: 1800, precio_stock: 1600, stock_habilitado: true, stock_cantidad: 20 },
      { nombre: "Guía de válvula de bronce 7mm", precio: 2200, precio_stock: 0, stock_habilitado: false, stock_cantidad: 0 },
      { nombre: "Sello de válvula universal", precio: 900, precio_stock: 0, stock_habilitado: false, stock_cantidad: 0 },
      { nombre: "Kit de válvulas completo Honda 1.6", precio: 28000, precio_stock: 0, stock_habilitado: false, stock_cantidad: 0 },
    ],
  },
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

  console.log("Limpiando datos DS previos...");

  // Limpiar órdenes de trabajo DS (repuestos y trabajos se borran en cascada)
  const ordenesPrevias = await sql`
    SELECT id FROM ordenes_trabajo
    WHERE observaciones ILIKE ${`${DEV_TRABAJO_TAG}%`}
  `;
  for (const orden of ordenesPrevias) {
    await sql`DELETE FROM orden_trabajo_trabajos WHERE orden_trabajo_id = ${orden.id}`;
    await sql`DELETE FROM orden_trabajo_repuestos WHERE orden_trabajo_id = ${orden.id}`;
  }
  await sql`DELETE FROM ordenes_trabajo WHERE observaciones ILIKE ${`${DEV_TRABAJO_TAG}%`}`;

  // Limpiar clientes DS
  await sql`DELETE FROM clientes WHERE mail ILIKE ${`%${DEV_CLIENT_EMAIL_DOMAIN}`}`;

  // Limpiar trabajos DS (categorías primero por CASCADE)
  const categoriasTrabajoPrevias = await sql`
    SELECT id FROM categorias_trabajo WHERE nombre ILIKE ${`${DEV_SEED_TAG}%`}
  `;
  for (const cat of categoriasTrabajoPrevias) {
    await sql`DELETE FROM trabajos WHERE categoria_id = ${cat.id}`;
  }
  await sql`DELETE FROM categorias_trabajo WHERE nombre ILIKE ${`${DEV_SEED_TAG}%`}`;

  // Limpiar repuestos DS
  await sql`DELETE FROM categorias_repuesto WHERE nombre ILIKE ${`${DEV_SEED_TAG}%`}`;

  // -------------------------------------------------------------------------
  // 1. Crear categorías de trabajos con precios en las 5 listas
  // -------------------------------------------------------------------------
  console.log("Creando categorías y trabajos con lista de precios...");

  const trabajoInsertados = [];

  for (let catIdx = 0; catIdx < CATEGORIAS_TRABAJO.length; catIdx++) {
    const cat = CATEGORIAS_TRABAJO[catIdx];

    const [catRow] = await sql`
      INSERT INTO categorias_trabajo (nombre, icono)
      VALUES (${cat.nombre}, ${cat.icono})
      RETURNING id
    `;

    for (let tIdx = 0; tIdx < cat.trabajos.length; tIdx++) {
      const t = cat.trabajos[tIdx];
      const [row] = await sql`
        INSERT INTO trabajos (
          categoria_id, nombre, precio,
          precio_lista_1, precio_lista_2, precio_lista_3, precio_lista_4, precio_lista_5,
          orden
        )
        VALUES (
          ${catRow.id}, ${t.nombre}, ${t.lista1},
          ${t.lista1}, ${t.lista2}, ${t.lista3}, ${t.lista4}, ${t.lista5},
          ${(tIdx + 1) * 10}
        )
        RETURNING id, nombre
      `;
      trabajoInsertados.push(row);
    }
  }

  console.log(`  → ${trabajoInsertados.length} trabajos creados en ${CATEGORIAS_TRABAJO.length} categorías`);

  // -------------------------------------------------------------------------
  // 2. Crear categorías de repuestos con algunos en stock y otros sin stock
  // -------------------------------------------------------------------------
  console.log("Creando categorías y repuestos (con y sin stock)...");

  const repuestoInsertados = [];

  for (let catIdx = 0; catIdx < CATEGORIAS_REPUESTO.length; catIdx++) {
    const cat = CATEGORIAS_REPUESTO[catIdx];

    const [catRow] = await sql`
      INSERT INTO categorias_repuesto (nombre)
      VALUES (${cat.nombre})
      RETURNING id
    `;

    for (let rIdx = 0; rIdx < cat.repuestos.length; rIdx++) {
      const r = cat.repuestos[rIdx];
      const [row] = await sql`
        INSERT INTO repuestos (
          categoria_id, nombre, precio, precio_stock,
          stock_habilitado, stock_cantidad, orden
        )
        VALUES (
          ${catRow.id}, ${r.nombre}, ${r.precio}, ${r.precio_stock},
          ${r.stock_habilitado}, ${r.stock_cantidad}, ${(rIdx + 1) * 10}
        )
        RETURNING id, nombre, stock_habilitado, stock_cantidad
      `;
      repuestoInsertados.push(row);
    }
  }

  const conStock = repuestoInsertados.filter((r) => r.stock_habilitado);
  const sinStock = repuestoInsertados.filter((r) => !r.stock_habilitado);
  console.log(`  → ${repuestoInsertados.length} repuestos: ${conStock.length} con stock, ${sinStock.length} sin stock`);

  // -------------------------------------------------------------------------
  // 3. Crear clientes de desarrollo
  // -------------------------------------------------------------------------
  console.log(`Creando ${DEV_CLIENTS_COUNT} clientes de desarrollo...`);

  const clientes = [];
  const baseAlta = new Date("2026-01-15T09:00:00.000Z");

  for (let index = 0; index < DEV_CLIENTS_COUNT; index++) {
    const nombre = nombres[index % nombres.length];
    const apellido = apellidos[index % apellidos.length];
    const direccion = `${calles[index % calles.length]} ${120 + index * 17}`;
    const ciudad = ciudades[index % ciudades.length];
    const provincia = provincias[index % provincias.length];
    const cp = cps[index % cps.length];
    const telefono = `11${String(32000000 + index * 731).padStart(8, "0")}`;
    const mail = `${nombre.toLowerCase()}.${apellido.toLowerCase()}.${index + 1}${DEV_CLIENT_EMAIL_DOMAIN}`;
    const fechaAlta = toIso(plusDays(baseAlta, index));

    const [inserted] = await sql`
      INSERT INTO clientes (nombre, apellido, telefono, mail, ciudad, direccion, provincia, cp, fecha_alta)
      VALUES (${nombre}, ${apellido}, ${telefono}, ${mail}, ${ciudad}, ${direccion}, ${provincia}, ${cp}, ${fechaAlta})
      RETURNING id, numero_cliente, nombre, apellido
    `;
    clientes.push(inserted);
  }

  // -------------------------------------------------------------------------
  // 4. Crear órdenes de trabajo usando la nueva lista de precios y repuestos
  // -------------------------------------------------------------------------
  console.log(`Creando ${DEV_ORDENES_COUNT} órdenes de trabajo...`);

  const combinaciones = await technicalSql`
    SELECT
      ma.id AS marca_id, ma.nombre AS marca_nombre,
      mo.id AS modelo_id, mo.nombre AS modelo_nombre,
      m.id  AS motor_id,  m.nombre  AS motor_nombre
    FROM vehiculos v
    INNER JOIN modelos mo ON mo.id = v.modelo_id
    INNER JOIN marcas  ma ON ma.id = mo.marca_id
    INNER JOIN motores m  ON m.id  = v.motor_id
    ORDER BY ma.nombre ASC, mo.nombre ASC, m.nombre ASC
    LIMIT 120
  `;

  if (combinaciones.length === 0) {
    throw new Error("No hay combinaciones marca/modelo/motor disponibles para sembrar trabajos.");
  }
  if (trabajoInsertados.length === 0) {
    throw new Error("No hay trabajos insertados para asociar a las órdenes.");
  }

  const baseTrabajo = new Date("2026-03-01T10:00:00.000Z");
  const prioridades = ["baja", "normal", "alta"];
  const estados = ["pendiente", "aprobado", "finalizado"];
  // Listas de precio que van a usar las órdenes (cíclico)
  const listas = [1, 2, 3, 4, 5];
  let ordenesCreadas = 0;

  for (let index = 0; index < DEV_ORDENES_COUNT; index++) {
    const cliente = clientes[index % clientes.length];
    const combinacion = combinaciones[index % combinaciones.length];
    const estado = estados[index % estados.length];
    const prioridad = prioridades[index % prioridades.length];
    const lista = listas[index % listas.length];
    const fechaCreacion = toIso(plusDays(baseTrabajo, index));
    const fechaAprobacion =
      estado === "aprobado" || estado === "finalizado"
        ? toIso(plusDays(baseTrabajo, index + 2))
        : null;
    const observaciones = `${DEV_TRABAJO_TAG} Orden demo ${index + 1} para ${cliente.apellido}, ${cliente.nombre} — Lista ${lista}`;
    const serie = `DEV-${String(index + 1).padStart(4, "0")}-${combinacion.motor_id}`;

    const [insertedOrden] = await sql`
      INSERT INTO ordenes_trabajo (
        cliente_id, marca_id, modelo_id, motor_id,
        numero_serie_motor, prioridad, estado,
        fecha_creacion, fecha_aprobacion, observaciones,
        lista_precio
      )
      VALUES (
        ${cliente.id}, ${combinacion.marca_id}, ${combinacion.modelo_id}, ${combinacion.motor_id},
        ${serie}, ${prioridad}, ${estado},
        ${fechaCreacion}, ${fechaAprobacion}, ${observaciones},
        ${lista}
      )
      RETURNING id
    `;

    const ordenId = insertedOrden.id;

    // Asociar 2–4 trabajos del catálogo
    const trabajosPorOrden = 2 + (index % 3);
    for (let offset = 0; offset < trabajosPorOrden; offset++) {
      const trabajo = trabajoInsertados[(index + offset) % trabajoInsertados.length];
      await sql`
        INSERT INTO orden_trabajo_trabajos (orden_trabajo_id, trabajo_id)
        VALUES (${ordenId}, ${trabajo.id})
        ON CONFLICT (orden_trabajo_id, trabajo_id) DO NOTHING
      `;
    }

    // Asociar repuestos: alternar entre órdenes con stock y sin stock
    // Órdenes pares: 1 repuesto con stock + 1 sin stock
    // Órdenes impares: solo 1 repuesto sin stock
    if (index % 2 === 0 && conStock.length > 0) {
      const repConStock = conStock[index % conStock.length];
      const cantidadTotal = 2;
      const cantidadStock = 1;
      await sql`
        INSERT INTO orden_trabajo_repuestos (
          orden_trabajo_id, repuesto_id,
          precio, precio_stock,
          cantidad, cantidad_stock,
          categoria_nombre_snapshot, repuesto_nombre_snapshot
        )
        VALUES (
          ${ordenId}, ${repConStock.id},
          ${CATEGORIAS_REPUESTO.flatMap((c) => c.repuestos).find((r) => r.nombre === repConStock.nombre)?.precio ?? 0},
          ${CATEGORIAS_REPUESTO.flatMap((c) => c.repuestos).find((r) => r.nombre === repConStock.nombre)?.precio_stock ?? 0},
          ${cantidadTotal}, ${cantidadStock},
          ${CATEGORIAS_REPUESTO.find((c) => c.repuestos.some((r) => r.nombre === repConStock.nombre))?.nombre ?? ""},
          ${repConStock.nombre}
        )
        ON CONFLICT (orden_trabajo_id, repuesto_id) DO NOTHING
      `;
    }

    if (sinStock.length > 0) {
      const repSinStock = sinStock[index % sinStock.length];
      await sql`
        INSERT INTO orden_trabajo_repuestos (
          orden_trabajo_id, repuesto_id,
          precio, precio_stock,
          cantidad, cantidad_stock,
          categoria_nombre_snapshot, repuesto_nombre_snapshot
        )
        VALUES (
          ${ordenId}, ${repSinStock.id},
          ${CATEGORIAS_REPUESTO.flatMap((c) => c.repuestos).find((r) => r.nombre === repSinStock.nombre)?.precio ?? 0},
          0,
          1, 0,
          ${CATEGORIAS_REPUESTO.find((c) => c.repuestos.some((r) => r.nombre === repSinStock.nombre))?.nombre ?? ""},
          ${repSinStock.nombre}
        )
        ON CONFLICT (orden_trabajo_id, repuesto_id) DO NOTHING
      `;
    }

    ordenesCreadas++;
  }

  console.log(`\nSeed completado:`);
  console.log(`  ${clientes.length} clientes`);
  console.log(`  ${CATEGORIAS_TRABAJO.length} categorías de trabajos, ${trabajoInsertados.length} trabajos`);
  console.log(`  ${CATEGORIAS_REPUESTO.length} categorías de repuestos, ${repuestoInsertados.length} repuestos (${conStock.length} con stock)`);
  console.log(`  ${ordenesCreadas} órdenes de trabajo con trabajos y repuestos`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
