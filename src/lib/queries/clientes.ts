import { queryRows, templateRows } from "@/lib/db";
import { listMarcas, listModelos, listMotores } from "@/lib/queries/catalogo";
import type {
  ClienteDetail,
  ClienteFormValues,
  ClienteListItem,
  ClientePendingTrabajoItem,
} from "@/lib/types";

type ListClientesParams = {
  search?: string;
  limit?: number;
  offset?: number;
};

type ClientePendingTrabajoRow = Omit<
  ClientePendingTrabajoItem,
  "marca_nombre" | "modelo_nombre" | "motor_nombre"
>;

export async function listClientes({
  search,
  limit,
  offset,
}: ListClientesParams = {}) {
  const normalizedSearch = search?.trim();
  const normalizedLimit = limit ?? 20;
  const normalizedOffset = offset ?? 0;

  if (normalizedSearch) {
    return templateRows<ClienteListItem>`
      SELECT
        id,
        numero_cliente,
        nombre,
        apellido,
        telefono,
        fecha_alta
      FROM clientes
      WHERE
        nombre ILIKE ${`%${normalizedSearch}%`}
        OR apellido ILIKE ${`%${normalizedSearch}%`}
      ORDER BY numero_cliente DESC
      LIMIT ${normalizedLimit}
      OFFSET ${normalizedOffset}
    `;
  }

  return templateRows<ClienteListItem>`
    SELECT
      id,
      numero_cliente,
      nombre,
      apellido,
      telefono,
      fecha_alta
    FROM clientes
    ORDER BY numero_cliente DESC
    LIMIT ${normalizedLimit}
    OFFSET ${normalizedOffset}
  `;
}

export async function countClientes(search?: string) {
  const normalizedSearch = search?.trim();

  if (normalizedSearch) {
    const rows = await templateRows<{ total: number }>`
      SELECT COUNT(*)::int AS total
      FROM clientes
      WHERE
        nombre ILIKE ${`%${normalizedSearch}%`}
        OR apellido ILIKE ${`%${normalizedSearch}%`}
    `;

    return rows[0]?.total ?? 0;
  }

  const rows = await templateRows<{ total: number }>`
    SELECT COUNT(*)::int AS total
    FROM clientes
  `;

  return rows[0]?.total ?? 0;
}

export async function findClientesByName(search: string) {
  const normalizedSearch = search.trim();

  if (!normalizedSearch) {
    return [];
  }

  return templateRows<ClienteListItem>`
    SELECT
      id,
      numero_cliente,
      nombre,
      apellido,
      telefono,
      fecha_alta
    FROM clientes
    WHERE
      nombre ILIKE ${`%${normalizedSearch}%`}
      OR apellido ILIKE ${`%${normalizedSearch}%`}
    ORDER BY apellido ASC, nombre ASC
    LIMIT 10
  `;
}

export async function getClienteById(id: number) {
  const rows = await templateRows<ClienteDetail>`
    SELECT
      id,
      numero_cliente,
      nombre,
      apellido,
      direccion,
      ciudad,
      provincia,
      cp,
      telefono,
      mail,
      dni,
      cuit,
      fecha_alta
    FROM clientes
    WHERE id = ${id}
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function listPendingTrabajosByClienteIds(clienteIds: number[]) {
  if (clienteIds.length === 0) {
    return [] as ClientePendingTrabajoItem[];
  }

  const [rows, [marcas, modelos, motores]] = await Promise.all([
    queryRows<ClientePendingTrabajoRow>(
      `
        SELECT
          p.cliente_id,
          p.id,
          p.numero_trabajo,
          p.cobrado,
          p.estado,
          p.prioridad,
          p.fecha_creacion,
          p.marca_id,
          p.modelo_id,
          p.motor_id,
          p.numero_serie_motor
        FROM ordenes_trabajo p
        WHERE p.cliente_id = ANY($1::int[])
          AND p.estado <> 'finalizado'
        ORDER BY
          p.cliente_id ASC,
          CASE
            WHEN p.prioridad = 'alta' THEN 1
            WHEN p.prioridad = 'normal' THEN 2
            ELSE 3
          END,
          p.fecha_creacion ASC,
          p.numero_trabajo ASC
      `,
      [clienteIds]
    ),
    Promise.all([listMarcas(), listModelos(), listMotores()]),
  ]);

  if (rows.length === 0) return [] as ClientePendingTrabajoItem[];

  const marcasById = new Map(marcas.map((m) => [m.id, m.nombre]));
  const modelosById = new Map(modelos.map((m) => [m.id, m.nombre]));
  const motoresById = new Map(motores.map((m) => [m.id, m.nombre]));

  return rows.map((item) => ({
    ...item,
    marca_nombre: item.marca_id ? (marcasById.get(item.marca_id) ?? null) : null,
    modelo_nombre: item.modelo_id ? (modelosById.get(item.modelo_id) ?? null) : null,
    motor_nombre: item.motor_id ? (motoresById.get(item.motor_id) ?? null) : null,
  })) as ClientePendingTrabajoItem[];
}

export async function createCliente(input: ClienteFormValues) {
  const rows = await templateRows<{ id: number }>`
    INSERT INTO clientes (nombre, apellido, telefono, mail, ciudad, direccion, provincia, cp, dni, cuit)
    VALUES (
      ${input.nombre},
      ${input.apellido},
      ${input.telefono || null},
      ${input.mail || null},
      ${input.ciudad || null},
      ${input.direccion || null},
      ${input.provincia || null},
      ${input.cp || null},
      ${input.dni || null},
      ${input.cuit || null}
    )
    RETURNING id
  `;

  return rows[0]?.id ?? null;
}

export async function updateCliente(id: number, input: ClienteFormValues) {
  const rows = await templateRows<{ id: number }>`
    UPDATE clientes
    SET
      nombre = ${input.nombre},
      apellido = ${input.apellido},
      telefono = ${input.telefono || null},
      mail = ${input.mail || null},
      ciudad = ${input.ciudad || null},
      direccion = ${input.direccion || null},
      provincia = ${input.provincia || null},
      cp = ${input.cp || null},
      dni = ${input.dni || null},
      cuit = ${input.cuit || null}
    WHERE id = ${id}
    RETURNING id
  `;

  return rows[0]?.id ?? null;
}
