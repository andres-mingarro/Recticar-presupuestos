import {
  queryRowsFromTechnical,
  templateRowsFromTechnical,
} from "@/lib/db";
import type {
  TechnicalMarca,
  TechnicalModelo,
  TechnicalMotor,
  TechnicalVehiculo,
} from "@/lib/types";

export type TechnicalSection = "marcas" | "modelos" | "motores" | "vehiculos";

function buildSearch(value?: string) {
  return value?.trim() ? `%${value.trim()}%` : null;
}

export async function listTechnicalMarcas({ search, limit, offset }: {
  search?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const normalizedSearch = buildSearch(search);
  const normalizedLimit = limit ?? 20;
  const normalizedOffset = offset ?? 0;

  if (normalizedSearch) {
    return templateRowsFromTechnical<TechnicalMarca>`
      SELECT id, nombre
      FROM marcas
      WHERE nombre ILIKE ${normalizedSearch}
      ORDER BY nombre ASC
      LIMIT ${normalizedLimit}
      OFFSET ${normalizedOffset}
    `;
  }

  return templateRowsFromTechnical<TechnicalMarca>`
    SELECT id, nombre
    FROM marcas
    ORDER BY nombre ASC
    LIMIT ${normalizedLimit}
    OFFSET ${normalizedOffset}
  `;
}

export async function listTechnicalModelos({ search, limit, offset }: {
  search?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const normalizedSearch = buildSearch(search);
  const normalizedLimit = limit ?? 20;
  const normalizedOffset = offset ?? 0;

  const rows = await queryRowsFromTechnical<{
    id: number;
    nombre: string;
    marca_id: number;
    marca_nombre: string | null;
  }>(
    `
      SELECT
        mo.id,
        mo.nombre,
        mo.marca_id,
        ma.nombre AS marca_nombre
      FROM modelos mo
      LEFT JOIN marcas ma ON ma.id = mo.marca_id
      ${normalizedSearch ? "WHERE mo.nombre ILIKE $3 OR ma.nombre ILIKE $3" : ""}
      ORDER BY ma.nombre ASC NULLS LAST, mo.nombre ASC
      LIMIT $1
      OFFSET $2
    `,
    normalizedSearch
      ? [normalizedLimit, normalizedOffset, normalizedSearch]
      : [normalizedLimit, normalizedOffset]
  );

  return rows.map((row) => ({
    id: row.id,
    nombre: row.nombre,
    marcaId: row.marca_id,
    marcaNombre: row.marca_nombre,
  })) as TechnicalModelo[];
}

export async function listTechnicalMotores({ search, limit, offset }: {
  search?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const normalizedSearch = buildSearch(search);
  const normalizedLimit = limit ?? 20;
  const normalizedOffset = offset ?? 0;

  const rows = await queryRowsFromTechnical<{
    id: number;
    nombre: string;
    cilindrada: string | null;
  }>(
    `
      SELECT
        id,
        nombre,
        cilindrada
      FROM motores
      ${normalizedSearch ? "WHERE nombre ILIKE $3 OR COALESCE(cilindrada, '') ILIKE $3" : ""}
      ORDER BY nombre ASC
      LIMIT $1
      OFFSET $2
    `,
    normalizedSearch
      ? [normalizedLimit, normalizedOffset, normalizedSearch]
      : [normalizedLimit, normalizedOffset]
  );

  return rows as TechnicalMotor[];
}

export async function listTechnicalVehiculos({ search, limit, offset }: {
  search?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const normalizedSearch = buildSearch(search);
  const normalizedLimit = limit ?? 20;
  const normalizedOffset = offset ?? 0;

  const rows = await queryRowsFromTechnical<{
    id: number;
    modelo_id: number;
    modelo_nombre: string;
    marca_nombre: string | null;
    motor_id: number;
    motor_nombre: string;
  }>(
    `
      SELECT
        v.id,
        v.modelo_id,
        mo.nombre AS modelo_nombre,
        ma.nombre AS marca_nombre,
        v.motor_id,
        mt.nombre AS motor_nombre
      FROM vehiculos v
      INNER JOIN modelos mo ON mo.id = v.modelo_id
      LEFT JOIN marcas ma ON ma.id = mo.marca_id
      INNER JOIN motores mt ON mt.id = v.motor_id
      ${
        normalizedSearch
          ? "WHERE mo.nombre ILIKE $3 OR mt.nombre ILIKE $3 OR COALESCE(ma.nombre, '') ILIKE $3"
          : ""
      }
      ORDER BY
        ma.nombre ASC NULLS LAST,
        mo.nombre ASC,
        mt.nombre ASC
      LIMIT $1
      OFFSET $2
    `,
    normalizedSearch
      ? [normalizedLimit, normalizedOffset, normalizedSearch]
      : [normalizedLimit, normalizedOffset]
  );

  return rows.map((row) => ({
    id: row.id,
    modeloId: row.modelo_id,
    modeloNombre: row.modelo_nombre,
    marcaNombre: row.marca_nombre,
    motorId: row.motor_id,
    motorNombre: row.motor_nombre,
  })) as TechnicalVehiculo[];
}

export async function countTechnicalMarcas(search?: string) {
  const normalizedSearch = buildSearch(search);
  const rows = normalizedSearch
    ? await templateRowsFromTechnical<{ total: number }>`
        SELECT COUNT(*)::int AS total
        FROM marcas
        WHERE nombre ILIKE ${normalizedSearch}
      `
    : await templateRowsFromTechnical<{ total: number }>`
        SELECT COUNT(*)::int AS total
        FROM marcas
      `;

  return rows[0]?.total ?? 0;
}

export async function countTechnicalModelos(search?: string) {
  const normalizedSearch = buildSearch(search);
  const rows = await queryRowsFromTechnical<{ total: number }>(
    `
      SELECT COUNT(*)::int AS total
      FROM modelos mo
      LEFT JOIN marcas ma ON ma.id = mo.marca_id
      ${normalizedSearch ? "WHERE mo.nombre ILIKE $1 OR ma.nombre ILIKE $1" : ""}
    `,
    normalizedSearch ? [normalizedSearch] : []
  );

  return rows[0]?.total ?? 0;
}

export async function countTechnicalMotores(search?: string) {
  const normalizedSearch = buildSearch(search);
  const rows = await queryRowsFromTechnical<{ total: number }>(
    `
      SELECT COUNT(*)::int AS total
      FROM motores
      ${normalizedSearch ? "WHERE nombre ILIKE $1 OR COALESCE(cilindrada, '') ILIKE $1" : ""}
    `,
    normalizedSearch ? [normalizedSearch] : []
  );

  return rows[0]?.total ?? 0;
}

export async function countTechnicalVehiculos(search?: string) {
  const normalizedSearch = buildSearch(search);
  const rows = await queryRowsFromTechnical<{ total: number }>(
    `
      SELECT COUNT(*)::int AS total
      FROM vehiculos v
      INNER JOIN modelos mo ON mo.id = v.modelo_id
      LEFT JOIN marcas ma ON ma.id = mo.marca_id
      INNER JOIN motores mt ON mt.id = v.motor_id
      ${
        normalizedSearch
          ? "WHERE mo.nombre ILIKE $1 OR mt.nombre ILIKE $1 OR COALESCE(ma.nombre, '') ILIKE $1"
          : ""
      }
    `,
    normalizedSearch ? [normalizedSearch] : []
  );

  return rows[0]?.total ?? 0;
}

export async function getTechnicalSectionCounts() {
  const [marcas, modelos, motores, vehiculos] = await Promise.all([
    countTechnicalMarcas(),
    countTechnicalModelos(),
    countTechnicalMotores(),
    countTechnicalVehiculos(),
  ]);

  return { marcas, modelos, motores, vehiculos };
}

export async function createTechnicalMarca(nombre: string) {
  await templateRowsFromTechnical`
    INSERT INTO marcas (nombre)
    VALUES (${nombre})
  `;
}

export async function updateTechnicalMarca(id: number, nombre: string) {
  await templateRowsFromTechnical`
    UPDATE marcas
    SET nombre = ${nombre}
    WHERE id = ${id}
  `;
}

export async function deleteTechnicalMarca(id: number) {
  await templateRowsFromTechnical`
    DELETE FROM marcas
    WHERE id = ${id}
  `;
}

export async function createTechnicalModelo(nombre: string, marcaId: number) {
  await templateRowsFromTechnical`
    INSERT INTO modelos (nombre, marca_id)
    VALUES (${nombre}, ${marcaId})
  `;
}

export async function updateTechnicalModelo(id: number, nombre: string, marcaId: number) {
  await templateRowsFromTechnical`
    UPDATE modelos
    SET
      nombre = ${nombre},
      marca_id = ${marcaId}
    WHERE id = ${id}
  `;
}

export async function deleteTechnicalModelo(id: number) {
  await templateRowsFromTechnical`
    DELETE FROM modelos
    WHERE id = ${id}
  `;
}

export async function createTechnicalMotor(nombre: string, cilindrada: string) {
  await templateRowsFromTechnical`
    INSERT INTO motores (nombre, cilindrada)
    VALUES (${nombre}, ${cilindrada || null})
  `;
}

export async function updateTechnicalMotor(id: number, nombre: string, cilindrada: string) {
  await templateRowsFromTechnical`
    UPDATE motores
    SET
      nombre = ${nombre},
      cilindrada = ${cilindrada || null}
    WHERE id = ${id}
  `;
}

export async function deleteTechnicalMotor(id: number) {
  await templateRowsFromTechnical`
    DELETE FROM motores
    WHERE id = ${id}
  `;
}

export async function createTechnicalVehiculo(modeloId: number, motorId: number) {
  await templateRowsFromTechnical`
    INSERT INTO vehiculos (modelo_id, motor_id)
    VALUES (${modeloId}, ${motorId})
  `;
}

export async function updateTechnicalVehiculo(id: number, modeloId: number, motorId: number) {
  await templateRowsFromTechnical`
    UPDATE vehiculos
    SET
      modelo_id = ${modeloId},
      motor_id = ${motorId}
    WHERE id = ${id}
  `;
}

export async function deleteTechnicalVehiculo(id: number) {
  await templateRowsFromTechnical`
    DELETE FROM vehiculos
    WHERE id = ${id}
  `;
}
