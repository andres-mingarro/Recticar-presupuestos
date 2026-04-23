import { notFound } from "next/navigation";
import { TrabajoDetailPage } from "@/components/pages/TrabajoDetailPage";
import type { TrabajoFormState } from "@/components/forms/TrabajoForm";
import {
  getTrabajosDetalleByTrabajo,
  listMarcas,
  listModeloMotorRelations,
  listModelos,
  listMotores,
  listTrabajosAgrupados,
} from "@/lib/queries/catalogo";
import { getRepuestosDetalleByTrabajo, listRepuestosAgrupados } from "@/lib/queries/repuestos";
import { getTrabajoDetailById, refreshTrabajoSnapshotPrices, updateTrabajo } from "@/lib/queries/trabajos";
import { generateQrSvg } from "@/lib/qr";
import { parseTrabajoRepuestos } from "@/lib/trabajo-repuestos";
import type { TrabajoFormValues } from "@/lib/types";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

function normalizeString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ updated?: string; created?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const trabajoId = Number(id);

  if (Number.isNaN(trabajoId)) {
    notFound();
  }

  const [trabajo, marcas, modelos, motores, relations, trabajos, repuestos] =
    await Promise.all([
      getTrabajoDetailById(trabajoId),
      listMarcas(),
      listModelos(),
      listMotores(),
      listModeloMotorRelations(),
      listTrabajosAgrupados(),
      listRepuestosAgrupados(),
    ]);

  if (!trabajo) {
    notFound();
  }

  const snapshotTrabajos = await getTrabajosDetalleByTrabajo(
    trabajoId,
    (trabajo.lista_precio as 1 | 2 | 3) ?? 1
  );
  const snapshotRepuestos = await getRepuestosDetalleByTrabajo(trabajoId);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const qrSvg = await generateQrSvg(`${baseUrl}/trabajos/${trabajoId}`);

  const initialState: TrabajoFormState = {
    error: null,
    values: {
      updatedAt: trabajo.updated_at,
      clienteId: trabajo.cliente_id ? String(trabajo.cliente_id) : "",
      marcaId: trabajo.marca_id ? String(trabajo.marca_id) : "",
      modeloId: trabajo.modelo_id ? String(trabajo.modelo_id) : "",
      motorId: trabajo.motor_id ? String(trabajo.motor_id) : "",
      numeroSerieMotor: trabajo.numero_serie_motor,
      cobrado: trabajo.cobrado,
      prioridad: trabajo.prioridad,
      estado: trabajo.estado,
      observaciones: trabajo.observaciones ?? "",
      trabajosIds: trabajo.trabajos_ids.map(String),
      repuestosIds: trabajo.repuestos_ids.map(String),
      repuestos: trabajo.repuestos,
      listaPrecios: (trabajo.lista_precio as 1 | 2 | 3) ?? 1,
      aplicaIva: trabajo.aplica_iva,
    },
  };

  async function updateTrabajoAction(
    _previousState: TrabajoFormState,
    formData: FormData
  ): Promise<TrabajoFormState> {
    "use server";

    const estadoRaw = normalizeString(formData.get("estado"));
    const estadoValue =
      estadoRaw === "aprobado"
        ? "aprobado"
        : estadoRaw === "presupuesto_entregado"
          ? "presupuesto_entregado"
        : estadoRaw === "finalizado"
          ? "finalizado"
          : "presupuesto_entregado";

    const values: TrabajoFormValues = {
      updatedAt: normalizeString(formData.get("updatedAt")),
      clienteId: normalizeString(formData.get("clienteId")),
      marcaId: normalizeString(formData.get("marcaId")),
      modeloId: normalizeString(formData.get("modeloId")),
      motorId: normalizeString(formData.get("motorId")),
      numeroSerieMotor: normalizeString(formData.get("numeroSerieMotor")),
      cobrado: formData.get("cobrado") === "true",
      prioridad:
        normalizeString(formData.get("prioridad")) === "alta"
          ? "alta"
          : normalizeString(formData.get("prioridad")) === "baja"
            ? "baja"
            : "normal",
      estado: estadoValue,
      observaciones: normalizeString(formData.get("observaciones")),
      trabajosIds: formData
        .getAll("trabajosIds")
        .filter((value): value is string => typeof value === "string"),
      repuestosIds: formData
        .getAll("repuestosIds")
        .filter((value): value is string => typeof value === "string"),
      repuestos: parseTrabajoRepuestos(formData),
      listaPrecios: (Number(normalizeString(formData.get("listaPrecios"))) || 1) as 1 | 2 | 3,
      aplicaIva: formData.get("aplicaIva") !== "false",
    };

    if (values.estado === "aprobado" && !values.clienteId) {
      return {
        error: "No se puede aprobar un trabajo sin cliente asignado.",
        values,
      };
    }

    const result = await updateTrabajo(trabajoId, values);

    if (result === "conflict") {
      return {
        error: "Otro usuario modificó este trabajo. Recargá la página para ver los últimos cambios antes de guardar.",
        values,
      };
    }

    return {
      error: null,
      values: { ...values, updatedAt: result.updatedAt },
    };
  }

  async function refreshSnapshotPricesAction(
    _prevState: { error: string | null; success: boolean; updatedCount: number },
    _formData: FormData
  ) {
    "use server";
    void _prevState;
    void _formData;

    const updatedCount = await refreshTrabajoSnapshotPrices(trabajoId);
    revalidatePath(`/trabajos/${trabajoId}`);

    return {
      error: null,
      success: true,
      updatedCount,
    };
  }

  return (
    <TrabajoDetailPage
      trabajo={trabajo}
      action={updateTrabajoAction}
      initialState={initialState}
      wasCreated={query?.created === "1"}
      wasUpdated={query?.updated === "1"}
      marcas={marcas}
      modelos={modelos}
      motores={motores}
      relations={relations}
      trabajos={trabajos}
      repuestos={repuestos}
      qrSvg={qrSvg}
      snapshotTrabajos={snapshotTrabajos}
      snapshotRepuestos={snapshotRepuestos}
      refreshSnapshotPricesAction={refreshSnapshotPricesAction}
    />
  );
}
