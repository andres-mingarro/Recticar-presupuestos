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
import { getPedidoDetailById, updatePedido } from "@/lib/queries/pedidos";
import { queryRows } from "@/lib/db";
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

  const [pedido, marcas, modelos, motores, relations, trabajos] =
    await Promise.all([
      getPedidoDetailById(pedidoId),
      listMarcas(),
      listModelos(),
      listMotores(),
      listModeloMotorRelations(),
      listTrabajosAgrupados(),
    ]);

  if (!pedido) {
    notFound();
  }

  const initialState: PedidoFormState = {
    error: null,
    values: {
      clienteId: pedido.cliente_id ? String(pedido.cliente_id) : "",
      marcaId: "",
      modeloId: "",
      motorId: "",
      numeroSerieMotor: pedido.numero_serie_motor,
      prioridad: pedido.prioridad,
      estado: pedido.estado,
      observaciones: pedido.observaciones ?? "",
      trabajosIds: pedido.trabajos_ids.map(String),
    },
  };

  // Populate marcaId/modeloId/motorId from catalog
  const matchedMotor = pedido.motor_nombre
    ? motores.find((m) => m.nombre === pedido.motor_nombre)
    : null;
  const matchedModelo = pedido.modelo_nombre
    ? modelos.find((m) => m.nombre === pedido.modelo_nombre)
    : null;
  const matchedMarca = pedido.marca_nombre
    ? marcas.find((m) => m.nombre === pedido.marca_nombre)
    : null;

  if (matchedMarca) initialState.values.marcaId = String(matchedMarca.id);
  if (matchedModelo) initialState.values.modeloId = String(matchedModelo.id);
  if (matchedMotor) initialState.values.motorId = String(matchedMotor.id);

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

    redirect(`/pedidos/${pedidoId}?updated=1`);
  }

  return (
    <PedidoDetailPage
      pedido={pedido}
      action={updatePedidoAction}
      changeEstadoAction={changeEstadoAction}
      changePrioridadAction={changePrioridadAction}
      initialState={initialState}
      wasUpdated={query?.updated === "1"}
      marcas={marcas}
      modelos={modelos}
      motores={motores}
      relations={relations}
      trabajos={trabajos}
    />
  );
}
