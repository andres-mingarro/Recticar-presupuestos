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

export function getSql() {
  if (cachedSql) {
    return cachedSql;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL no está configurada. Definila en .env.local para usar la app."
    );
  }

  cachedSql = neon(databaseUrl);
  return cachedSql;
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
