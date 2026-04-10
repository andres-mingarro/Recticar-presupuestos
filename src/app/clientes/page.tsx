import { ClientesPage } from "@/components/pages/ClientesPage";
import { listClientes } from "@/lib/queries/clientes";
import { resolveSearchParams } from "@/lib/search-params";
import type { ClienteListItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = await resolveSearchParams(searchParams);
  const q = typeof params.q === "string" ? params.q.trim() : "";

  let errorMessage: string | null = null;
  let clientes: ClienteListItem[] = [];

  try {
    clientes = await listClientes(q);
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "No se pudo cargar clientes.";
  }

  return <ClientesPage q={q} clientes={clientes} errorMessage={errorMessage} />;
}
