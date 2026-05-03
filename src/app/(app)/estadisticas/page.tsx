import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSessionWithPermisos, isSuperAdmin } from "@/lib/permisos";
import {
  getAniosConCobrados,
  getCobradosMensuales,
  getResumenAnual,
} from "@/lib/queries/estadisticas";
import { listHistorialAjustes } from "@/lib/queries/ajustes";
import { EstadisticasPage } from "@/components/pages/EstadisticasPage";

export const dynamic = "force-dynamic";

const ESTADISTICAS_COOKIE = "estadisticas_auth";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ año?: string }>;
}) {
  const { session } = await getSessionWithPermisos();
  if (!isSuperAdmin(session)) redirect("/");

  const jar = await cookies();
  if (jar.get(ESTADISTICAS_COOKIE)?.value !== "1") redirect("/configuracion");

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
