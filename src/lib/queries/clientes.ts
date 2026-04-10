import { templateRows } from "@/lib/db";
import type {
  ClienteDetail,
  ClienteFormValues,
  ClienteListItem,
} from "@/lib/types";

export async function listClientes(search?: string) {
  const normalizedSearch = search?.trim();

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
  `;
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
      telefono,
      mail,
      fecha_alta
    FROM clientes
    WHERE id = ${id}
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function createCliente(input: ClienteFormValues) {
  const rows = await templateRows<{ id: number }>`
    INSERT INTO clientes (nombre, apellido, direccion, telefono, mail)
    VALUES (
      ${input.nombre},
      ${input.apellido},
      ${input.direccion || null},
      ${input.telefono || null},
      ${input.mail || null}
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
      direccion = ${input.direccion || null},
      telefono = ${input.telefono || null},
      mail = ${input.mail || null}
    WHERE id = ${id}
    RETURNING id
  `;

  return rows[0]?.id ?? null;
}
