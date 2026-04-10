import { templateRows } from "@/lib/db";
import type { ClienteDetail, ClienteListItem } from "@/lib/types";

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
