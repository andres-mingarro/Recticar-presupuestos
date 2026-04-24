import { requirePermission } from "@/lib/permisos";
import {
  getAniosConCobrados,
  getCobradosMensuales,
  getResumenAnual,
} from "@/lib/queries/estadisticas";
import { listHistorialAjustes, getAcumuladoAjustes } from "@/lib/queries/ajustes";
import { EstadisticasPage } from "@/components/pages/EstadisticasPage";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ año?: string }>;
}) {
  await requirePermission("trabajos.ver");

  const params = await searchParams;

  const [aniosDisponibles, resumenAnual, historialAjustes, acumuladoAjustes] = await Promise.all([
    getAniosConCobrados(),
    getResumenAnual(),
    listHistorialAjustes(50),
    getAcumuladoAjustes(),
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
      acumuladoAjustes={acumuladoAjustes}
    />
  );
}
