import { redirect } from "next/navigation";
import { getSessionWithPermisos, isSuperAdmin } from "@/lib/permisos";
import {
  getAniosConCobrados,
  getCobradosMensuales,
  getResumenAnual,
} from "@/lib/queries/estadisticas";
import { listHistorialAjustes } from "@/lib/queries/ajustes";
import { EstadisticasPage } from "@/components/pages/EstadisticasPage";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ año?: string }>;
}) {
  const { session } = await getSessionWithPermisos();
  if (!isSuperAdmin(session)) redirect("/");

  const params = await searchParams;

  const [aniosDisponibles, resumenAnual, historialAjustes] = await Promise.all([
    getAniosConCobrados(),
    getResumenAnual(),
    listHistorialAjustes(),
  ]);

  const anioActual = new Date().getFullYear();
  const anioSeleccionado = params.año
    ? parseInt(params.año, 10)
    : (aniosDisponibles[0] ?? anioActual);

  const datosMensuales = await getCobradosMensuales(anioSeleccionado);

  return (
    <EstadisticasPage
      anioSeleccionado={anioSeleccionado}
      aniosDisponibles={aniosDisponibles}
      datosMensuales={datosMensuales}
      resumenAnual={resumenAnual}
      historialAjustes={historialAjustes}
    />
  );
}
