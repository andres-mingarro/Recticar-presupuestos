import { notFound, redirect } from "next/navigation";
import { TrabajoDetailPage } from "@/components/pages/TrabajoDetailPage";
import type { TrabajoFormState } from "@/components/forms/TrabajoForm";
import type { ChangeEstadoActionState } from "@/components/ui/EstadoStepper";
import {
  listMarcas,
  listModeloMotorRelations,
  listModelos,
  listMotores,
  listTrabajosAgrupados,
} from "@/lib/queries/catalogo";
import { listRepuestosAgrupados } from "@/lib/queries/repuestos";
import { getTrabajoDetailById, updateTrabajo } from "@/lib/queries/trabajos";
import { generateQrSvg } from "@/lib/qr";
import { queryRows } from "@/lib/db";
import { parseTrabajoRepuestos } from "@/lib/trabajo-repuestos";
import type { TrabajoEstado, TrabajoFormValues, TrabajoPrioridad } from "@/lib/types";
import type { ChangePrioridadActionState } from "@/components/ui/PrioridadSelector";

export const dynamic = "force-dynamic";

function normalizeString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

const VALID_ESTADOS: TrabajoEstado[] = ["pendiente", "aprobado", "finalizado"];
const VALID_PRIORIDADES: TrabajoPrioridad[] = ["baja", "normal", "alta"];

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
        : estadoRaw === "finalizado"
          ? "finalizado"
          : "pendiente";

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

  async function changeEstadoAction(
    _prevState: ChangeEstadoActionState,
    formData: FormData
  ): Promise<ChangeEstadoActionState> {
    "use server";

    const estadoRaw = normalizeString(formData.get("estado"));
    if (!VALID_ESTADOS.includes(estadoRaw as TrabajoEstado)) {
      return { error: "Estado inválido." };
    }
    const newEstado = estadoRaw as TrabajoEstado;

    // Fetch current cliente_id to validate
    const rows = await queryRows<{ cliente_id: number | null }>(
      "SELECT cliente_id FROM ordenes_trabajo WHERE id = $1 LIMIT 1",
      [trabajoId]
    );
    const current = rows[0];

    if (!current) return { error: "Trabajo no encontrado." };

    if (newEstado === "aprobado" && !current.cliente_id) {
      return { error: "Para aprobar el trabajo necesitás asignar un cliente primero." };
    }

    await queryRows(
      `UPDATE ordenes_trabajo SET
        estado = $2::orden_trabajo_estado,
        fecha_aprobacion = CASE
          WHEN $2::text = 'aprobado' AND fecha_aprobacion IS NULL THEN now()
          ELSE fecha_aprobacion
        END
       WHERE id = $1`,
      [trabajoId, newEstado]
    );

    redirect(`/trabajos/${trabajoId}?updated=1`);
  }

  async function changePrioridadAction(
    _prevState: ChangePrioridadActionState,
    formData: FormData
  ): Promise<ChangePrioridadActionState> {
    "use server";

    const raw = normalizeString(formData.get("prioridad"));
    if (!VALID_PRIORIDADES.includes(raw as TrabajoPrioridad)) {
      return { error: "Prioridad inválida." };
    }

    await queryRows(
      "UPDATE ordenes_trabajo SET prioridad = $2::orden_trabajo_prioridad WHERE id = $1",
      [trabajoId, raw]
    );

    return { error: null, success: true };
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
    />
  );
}
