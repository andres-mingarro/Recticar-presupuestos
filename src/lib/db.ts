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
  const rows = await getSql()(strings, ...values);
  return rows as T[];
}

export async function queryRows<T extends Record<string, unknown>>(
  query: string,
  params: QueryParams = []
) {
  const rows = await getSql().query(query, params);
  return rows as T[];
}

export async function templateRowsFromTechnical<T extends Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: QueryParams
) {
  const rows = await getTechnicalSql()(strings, ...values);
  return rows as T[];
}

export async function queryRowsFromTechnical<T extends Record<string, unknown>>(
  query: string,
  params: QueryParams = []
) {
  const rows = await getTechnicalSql().query(query, params);
  return rows as T[];
}
