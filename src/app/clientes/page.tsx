import { ClientesPage } from "@/components/pages/ClientesPage";
import { countClientes, listClientes } from "@/lib/queries/clientes";
import { resolveSearchParams } from "@/lib/search-params";
import type { ClienteListItem } from "@/lib/types";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; page?: string }>;
}) {
  const params = await resolveSearchParams(searchParams);
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const pageParam = typeof params.page === "string" ? Number(params.page) : 1;
  const currentPage =
    Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
  const offset = (currentPage - 1) * PAGE_SIZE;

  let errorMessage: string | null = null;
  let clientes: ClienteListItem[] = [];
  let totalClientes = 0;

  try {
    [clientes, totalClientes] = await Promise.all([
      listClientes({
        search: q,
        limit: PAGE_SIZE,
        offset,
      }),
      countClientes(q),
    ]);
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "No se pudo cargar clientes.";
  }

  return (
    <ClientesPage
      q={q}
      clientes={clientes}
      errorMessage={errorMessage}
      currentPage={currentPage}
      totalClientes={totalClientes}
      pageSize={PAGE_SIZE}
    />
  );
}
