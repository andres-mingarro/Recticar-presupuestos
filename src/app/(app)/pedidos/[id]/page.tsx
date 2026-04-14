import { notFound, redirect } from "next/navigation";
import { PedidoDetailPage } from "@/components/pages/PedidoDetailPage";
import type { PedidoFormState } from "@/components/forms/PedidoForm";
import type { ChangeEstadoActionState } from "@/components/ui/EstadoStepper";
import {
  listMarcas,
  listModeloMotorRelations,
  listModelos,
  listMotores,
  listTrabajosAgrupados,
} from "@/lib/queries/catalogo";
import { listRepuestosAgrupados } from "@/lib/queries/repuestos";
import { getPedidoDetailById, updatePedido } from "@/lib/queries/pedidos";
import { generateQrSvg } from "@/lib/qr";
import { queryRows } from "@/lib/db";
import { parsePedidoRepuestos } from "@/lib/pedido-repuestos";
import type { PedidoEstado, PedidoFormValues, PedidoPrioridad } from "@/lib/types";
import type { ChangePrioridadActionState } from "@/components/ui/PrioridadSelector";

export const dynamic = "force-dynamic";

function normalizeString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

const VALID_ESTADOS: PedidoEstado[] = ["pendiente", "aprobado", "finalizado"];
const VALID_PRIORIDADES: PedidoPrioridad[] = ["baja", "normal", "alta"];

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ updated?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const pedidoId = Number(id);

  if (Number.isNaN(pedidoId)) {
    notFound();
  }

  const [pedido, marcas, modelos, motores, relations, trabajos, repuestos] =
    await Promise.all([
      getPedidoDetailById(pedidoId),
      listMarcas(),
      listModelos(),
      listMotores(),
      listModeloMotorRelations(),
      listTrabajosAgrupados(),
      listRepuestosAgrupados(),
    ]);

  if (!pedido) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const qrSvg = await generateQrSvg(`${baseUrl}/pedidos/${pedidoId}`);

  const initialState: PedidoFormState = {
    error: null,
    values: {
      clienteId: pedido.cliente_id ? String(pedido.cliente_id) : "",
      marcaId: pedido.marca_id ? String(pedido.marca_id) : "",
      modeloId: pedido.modelo_id ? String(pedido.modelo_id) : "",
      motorId: pedido.motor_id ? String(pedido.motor_id) : "",
      numeroSerieMotor: pedido.numero_serie_motor,
      cobrado: pedido.cobrado,
      prioridad: pedido.prioridad,
      estado: pedido.estado,
      observaciones: pedido.observaciones ?? "",
      trabajosIds: pedido.trabajos_ids.map(String),
      repuestosIds: pedido.repuestos_ids.map(String),
      repuestos: pedido.repuestos,
      listaPrecios: (pedido.lista_precio as 1 | 2 | 3) ?? 1,
    },
  };

  async function updatePedidoAction(
    _previousState: PedidoFormState,
    formData: FormData
  ): Promise<PedidoFormState> {
    "use server";

    const estadoRaw = normalizeString(formData.get("estado"));
    const estadoValue =
      estadoRaw === "aprobado"
        ? "aprobado"
        : estadoRaw === "finalizado"
          ? "finalizado"
          : "pendiente";

    const values: PedidoFormValues = {
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
      repuestos: parsePedidoRepuestos(formData),
      listaPrecios: (Number(normalizeString(formData.get("listaPrecios"))) || 1) as 1 | 2 | 3,
    };

    if (values.estado === "aprobado" && !values.clienteId) {
      return {
        error: "No se puede aprobar un pedido sin cliente asignado.",
        values,
      };
    }

    const ok = await updatePedido(pedidoId, values);

    if (!ok) {
      return {
        error: "No se pudieron guardar los cambios. Probá nuevamente.",
        values,
      };
    }

    redirect(`/pedidos/${pedidoId}?updated=1`);
  }

  async function changeEstadoAction(
    _prevState: ChangeEstadoActionState,
    formData: FormData
  ): Promise<ChangeEstadoActionState> {
    "use server";

    const estadoRaw = normalizeString(formData.get("estado"));
    if (!VALID_ESTADOS.includes(estadoRaw as PedidoEstado)) {
      return { error: "Estado inválido." };
    }
    const newEstado = estadoRaw as PedidoEstado;

    // Fetch current cliente_id to validate
    const rows = await queryRows<{ cliente_id: number | null }>(
      "SELECT cliente_id FROM pedidos WHERE id = $1 LIMIT 1",
      [pedidoId]
    );
    const current = rows[0];

    if (!current) return { error: "Pedido no encontrado." };

    if (newEstado === "aprobado" && !current.cliente_id) {
      return { error: "Para aprobar el pedido necesitás asignar un cliente primero." };
    }

    await queryRows(
      `UPDATE pedidos SET
        estado = $2::pedido_estado,
        fecha_aprobacion = CASE
          WHEN $2::text = 'aprobado' AND fecha_aprobacion IS NULL THEN now()
          ELSE fecha_aprobacion
        END
       WHERE id = $1`,
      [pedidoId, newEstado]
    );

    redirect(`/pedidos/${pedidoId}?updated=1`);
  }

  async function changePrioridadAction(
    _prevState: ChangePrioridadActionState,
    formData: FormData
  ): Promise<ChangePrioridadActionState> {
    "use server";

    const raw = normalizeString(formData.get("prioridad"));
    if (!VALID_PRIORIDADES.includes(raw as PedidoPrioridad)) {
      return { error: "Prioridad inválida." };
    }

    await queryRows(
      "UPDATE pedidos SET prioridad = $2::pedido_prioridad WHERE id = $1",
      [pedidoId, raw]
    );

    return { error: null, success: true };
  }

  return (
    <PedidoDetailPage
      pedido={pedido}
      action={updatePedidoAction}
      initialState={initialState}
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
