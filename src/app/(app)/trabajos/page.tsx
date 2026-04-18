import { getSession } from "@/lib/auth";
import { TrabajosPage } from "@/components/pages/TrabajosPage";
import { listTrabajos } from "@/lib/queries/trabajos";
import { resolveSearchParams } from "@/lib/search-params";
import {
  TRABAJO_ESTADOS,
  TRABAJO_PRIORIDADES,
  type TrabajoEstado,
  type TrabajoListItem,
  type TrabajoPrioridad,
} from "@/lib/types";

export const dynamic = "force-dynamic";

function isTrabajoEstado(value: string): value is TrabajoEstado {
  return TRABAJO_ESTADOS.includes(value as TrabajoEstado);
}

function isTrabajoPrioridad(value: string): value is TrabajoPrioridad {
  return TRABAJO_PRIORIDADES.includes(value as TrabajoPrioridad);
}

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ estado?: string; prioridad?: string; numero?: string }>;
}) {
  const params = await resolveSearchParams(searchParams);
  const estado =
    typeof params.estado === "string" && isTrabajoEstado(params.estado)
      ? params.estado
      : undefined;
  const prioridad =
    typeof params.prioridad === "string" && isTrabajoPrioridad(params.prioridad)
      ? params.prioridad
      : undefined;
  const numeroTrabajo =
    typeof params.numero === "string" && /^\d+$/.test(params.numero)
      ? Number(params.numero)
      : undefined;

  const session = await getSession();
  const canEdit = session?.role !== "operador";

  let errorMessage: string | null = null;
  let trabajos: TrabajoListItem[] = [];

  try {
    trabajos = await listTrabajos({ estado, prioridad, numeroTrabajo });
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "No se pudo cargar trabajos.";
  }

  return (
    <TrabajosPage
      estado={estado}
      prioridad={prioridad}
      numeroTrabajo={numeroTrabajo}
      trabajos={trabajos}
      errorMessage={errorMessage}
      canEdit={canEdit}
    />
  );
}
