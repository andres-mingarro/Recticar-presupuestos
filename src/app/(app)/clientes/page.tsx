import { getSession } from "@/lib/auth";
import { ClientesPage } from "@/components/pages/ClientesPage";
import {
  countClientes,
  listClientes,
  listPendingTrabajosByClienteIds,
} from "@/lib/queries/clientes";
import { resolveSearchParams } from "@/lib/search-params";
import type { ClienteListItem, ClientePendingTrabajoItem } from "@/lib/types";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; page?: string }>;
}) {
  const session = await getSession();
  const canEdit = session?.role !== "operador";

  const params = await resolveSearchParams(searchParams);
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const pageParam = typeof params.page === "string" ? Number(params.page) : 1;
  const currentPage =
    Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
  const offset = (currentPage - 1) * PAGE_SIZE;

  let errorMessage: string | null = null;
  let clientes: ClienteListItem[] = [];
  let totalClientes = 0;
  let pendingTrabajosByCliente: Record<number, ClientePendingTrabajoItem[]> = {};

  try {
    [clientes, totalClientes] = await Promise.all([
      listClientes({
        search: q,
        limit: PAGE_SIZE,
        offset,
      }),
      countClientes(q),
    ]);

    const pendingTrabajos = await listPendingTrabajosByClienteIds(
      clientes.map((cliente) => cliente.id)
    );

    pendingTrabajosByCliente = pendingTrabajos.reduce<
      Record<number, ClientePendingTrabajoItem[]>
    >((acc, trabajo) => {
      if (!acc[trabajo.cliente_id]) {
        acc[trabajo.cliente_id] = [];
      }

      acc[trabajo.cliente_id].push(trabajo);
      return acc;
    }, {});
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "No se pudo cargar clientes.";
  }

  return (
    <ClientesPage
      q={q}
      clientes={clientes}
      pendingTrabajosByCliente={pendingTrabajosByCliente}
      errorMessage={errorMessage}
      currentPage={currentPage}
      totalClientes={totalClientes}
      pageSize={PAGE_SIZE}
      canEdit={canEdit}
    />
  );
}
