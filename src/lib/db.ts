import { neon } from "@neondatabase/serverless";

type NeonSql = ReturnType<typeof neon>;
type QueryParamValue =
  | string
  | number
  | boolean
  | null
  | string[]
  | number[]
  | boolean[];
type QueryParams = QueryParamValue[];

let cachedSql: NeonSql | null = null;
let cachedTechnicalSql: NeonSql | null = null;

function getDatabaseHost(databaseUrl: string) {
  try {
    return new URL(databaseUrl).host;
  } catch {
    return "host-desconocido";
  }
}

function requireDatabaseUrl(envKey: "DATABASE_URL" | "TECHNICAL_DATABASE_URL") {
  const fallbackKey = envKey === "TECHNICAL_DATABASE_URL" ? "DATABASE_URL" : null;
  const databaseUrl =
    process.env[envKey] ?? (fallbackKey ? process.env[fallbackKey] : undefined);

  if (!databaseUrl) {
    throw new Error(
      envKey === "TECHNICAL_DATABASE_URL"
        ? "TECHNICAL_DATABASE_URL no está configurada. Definila en .env.local para usar el catálogo técnico externo."
        : "DATABASE_URL no está configurada. Definila en .env.local para usar la app."
    );
  }

  return databaseUrl;
}

export function getSql() {
  if (cachedSql) {
    return cachedSql;
  }

  cachedSql = neon(requireDatabaseUrl("DATABASE_URL"));
  return cachedSql;
}

export function getTechnicalSql() {
  if (cachedTechnicalSql) {
    return cachedTechnicalSql;
  }

  cachedTechnicalSql = neon(requireDatabaseUrl("TECHNICAL_DATABASE_URL"));
  return cachedTechnicalSql;
}

export async function templateRows<T extends Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: QueryParams
) {
  try {
    const rows = await getSql()(strings, ...values);
    return rows as T[];
  } catch (error) {
    const databaseUrl = requireDatabaseUrl("DATABASE_URL");
    const causeMessage = error instanceof Error ? error.message : String(error);

    throw new Error(
      `No se pudo conectar a la base principal (${getDatabaseHost(databaseUrl)}). ` +
        `Verificá la red, la disponibilidad de Neon y la variable DATABASE_URL. ` +
        `Detalle: ${causeMessage}`
    );
  }
}

export async function queryRows<T extends Record<string, unknown>>(
  query: string,
  params: QueryParams = []
) {
  try {
    const rows = await getSql().query(query, params);
    return rows as T[];
  } catch (error) {
    const databaseUrl = requireDatabaseUrl("DATABASE_URL");
    const causeMessage = error instanceof Error ? error.message : String(error);

    throw new Error(
      `No se pudo conectar a la base principal (${getDatabaseHost(databaseUrl)}). ` +
        `Verificá la red, la disponibilidad de Neon y la variable DATABASE_URL. ` +
        `Detalle: ${causeMessage}`
    );
  }
}

export async function templateRowsFromTechnical<T extends Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: QueryParams
) {
  try {
    const rows = await getTechnicalSql()(strings, ...values);
    return rows as T[];
  } catch (error) {
    const databaseUrl = requireDatabaseUrl("TECHNICAL_DATABASE_URL");
    const causeMessage = error instanceof Error ? error.message : String(error);

    throw new Error(
      `No se pudo conectar a la base técnica (${getDatabaseHost(databaseUrl)}). ` +
        `Verificá la red, la disponibilidad de Neon y la variable TECHNICAL_DATABASE_URL. ` +
        `Detalle: ${causeMessage}`
    );
  }
}

export async function queryRowsFromTechnical<T extends Record<string, unknown>>(
  query: string,
  params: QueryParams = []
) {
  try {
    const rows = await getTechnicalSql().query(query, params);
    return rows as T[];
  } catch (error) {
    const databaseUrl = requireDatabaseUrl("TECHNICAL_DATABASE_URL");
    const causeMessage = error instanceof Error ? error.message : String(error);

    throw new Error(
      `No se pudo conectar a la base técnica (${getDatabaseHost(databaseUrl)}). ` +
        `Verificá la red, la disponibilidad de Neon y la variable TECHNICAL_DATABASE_URL. ` +
        `Detalle: ${causeMessage}`
    );
  }
}

/** Fuente de verdad única para el nombre de columna SQL de lista de precios en la tabla trabajos (alias t). */
export function precioListaColName(lista: 1 | 2 | 3): string {
  if (lista === 3) return "t.precio_lista_3";
  if (lista === 2) return "t.precio_lista_2";
  return "t.precio_lista_1";
}
