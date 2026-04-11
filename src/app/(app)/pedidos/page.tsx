import { getSession } from "@/lib/auth";
import { PedidosPage } from "@/components/pages/PedidosPage";
import { listPedidos } from "@/lib/queries/pedidos";
import { resolveSearchParams } from "@/lib/search-params";
import {
  PEDIDO_ESTADOS,
  PEDIDO_PRIORIDADES,
  type PedidoEstado,
  type PedidoListItem,
  type PedidoPrioridad,
} from "@/lib/types";

export const dynamic = "force-dynamic";

function isPedidoEstado(value: string): value is PedidoEstado {
  return PEDIDO_ESTADOS.includes(value as PedidoEstado);
}

function isPedidoPrioridad(value: string): value is PedidoPrioridad {
  return PEDIDO_PRIORIDADES.includes(value as PedidoPrioridad);
}

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ estado?: string; prioridad?: string }>;
}) {
  const params = await resolveSearchParams(searchParams);
  const estado =
    typeof params.estado === "string" && isPedidoEstado(params.estado)
      ? params.estado
      : undefined;
  const prioridad =
    typeof params.prioridad === "string" && isPedidoPrioridad(params.prioridad)
      ? params.prioridad
      : undefined;

  const session = await getSession();
  const canEdit = session?.role !== "operador";

  let errorMessage: string | null = null;
  let pedidos: PedidoListItem[] = [];

  try {
    pedidos = await listPedidos({ estado, prioridad });
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "No se pudo cargar pedidos.";
  }

  return (
    <PedidosPage
      estado={estado}
      prioridad={prioridad}
      pedidos={pedidos}
      errorMessage={errorMessage}
      canEdit={canEdit}
    />
  );
}
