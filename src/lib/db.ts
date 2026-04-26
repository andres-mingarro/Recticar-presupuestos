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

/** Fuente de verdad: cuántas listas de precios existen. Agregar una lista = cambiar solo este array. */
export const LISTAS_PRECIOS = [1, 2, 3, 4, 5] as const;
export type ListaPrecio = (typeof LISTAS_PRECIOS)[number];

/** Tipo que tiene precioLista1..N derivado de LISTAS_PRECIOS. */
export type PreciosLista = { [K in ListaPrecio as `precioLista${K}`]: number };

/** Lee precioListaN de un objeto que implementa PreciosLista. */
export function getPrecioLista(t: PreciosLista, lista: ListaPrecio): number {
  return t[`precioLista${lista}`];
}

/** Nombre de columna SQL para la tabla trabajos (alias t). */
export function precioListaColName(lista: ListaPrecio): string {
  return `t.precio_lista_${lista}`;
}
