export type SearchParamValue = string | string[] | undefined;
export type SearchParamsInput =
  | Record<string, SearchParamValue>
  | Promise<Record<string, SearchParamValue>>;

export async function resolveSearchParams(searchParams?: SearchParamsInput) {
  return (await searchParams) ?? {};
}
