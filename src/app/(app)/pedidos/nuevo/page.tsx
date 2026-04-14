import { redirect } from "next/navigation";
import { NuevoPedidoPage } from "@/components/pages/NuevoPedidoPage";
import type { PedidoFormState } from "@/components/forms/PedidoForm";
import { parsePedidoRepuestos } from "@/lib/pedido-repuestos";
import {
  listMarcas,
  listModeloMotorRelations,
  listModelos,
  listMotores,
  listTrabajosAgrupados,
} from "@/lib/queries/catalogo";
import { listRepuestosAgrupados } from "@/lib/queries/repuestos";
import { createPedido } from "@/lib/queries/pedidos";
import { getClienteById } from "@/lib/queries/clientes";
import type { PedidoFormValues } from "@/lib/types";

export const dynamic = "force-dynamic";

const initialState: PedidoFormState = {
  error: null,
  values: {
    clienteId: "",
    marcaId: "",
    modeloId: "",
    motorId: "",
    numeroSerieMotor: "",
    cobrado: false,
    prioridad: "normal",
    estado: "pendiente",
    observaciones: "",
    trabajosIds: [],
    repuestosIds: [],
    repuestos: [],
    listaPrecios: 1,
  },
};

function normalizeString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ clienteId?: string }>;
}) {
  const params = await searchParams;
  const clienteIdParam =
    typeof params?.clienteId === "string" ? Number(params.clienteId) : Number.NaN;
  const selectedClienteId =
    Number.isFinite(clienteIdParam) && clienteIdParam > 0 ? String(clienteIdParam) : "";

  const [marcas, modelos, motores, relations, trabajos, repuestos, cliente] =
    await Promise.all([
      listMarcas(),
      listModelos(),
      listMotores(),
      listModeloMotorRelations(),
      listTrabajosAgrupados(),
      listRepuestosAgrupados(),
      selectedClienteId ? getClienteById(Number(selectedClienteId)) : Promise.resolve(null),
    ]);

  const initialStateWithCliente: PedidoFormState = {
    ...initialState,
    values: {
      ...initialState.values,
      clienteId: cliente ? String(cliente.id) : "",
    },
  };

  const initialClienteLabel = cliente
    ? `#${cliente.numero_cliente} · ${cliente.apellido}, ${cliente.nombre}`
    : "";

  async function createPedidoAction(
    _previousState: PedidoFormState,
    formData: FormData
  ): Promise<PedidoFormState> {
    "use server";

    const values: PedidoFormValues = {
      clienteId: normalizeString(formData.get("clienteId")),
      marcaId: normalizeString(formData.get("marcaId")),
      modeloId: normalizeString(formData.get("modeloId")),
      motorId: normalizeString(formData.get("motorId")),
      numeroSerieMotor: normalizeString(formData.get("numeroSerieMotor")),
      cobrado: formData.get("cobrado") === "on",
      prioridad:
        normalizeString(formData.get("prioridad")) === "alta"
          ? "alta"
          : normalizeString(formData.get("prioridad")) === "baja"
            ? "baja"
            : "normal",
      estado:
        normalizeString(formData.get("estado")) === "aprobado"
          ? "aprobado"
          : "pendiente",
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

    const pedidoId = await createPedido(values);

    if (!pedidoId) {
      return {
        error: "No se pudo crear el pedido. Probá nuevamente.",
        values,
      };
    }

    redirect(`/pedidos/${pedidoId}`);
  }

  return (
    <NuevoPedidoPage
      action={createPedidoAction}
      initialState={initialStateWithCliente}
      initialClienteLabel={initialClienteLabel}
      marcas={marcas}
      modelos={modelos}
      motores={motores}
      relations={relations}
      trabajos={trabajos}
      repuestos={repuestos}
    />
  );
}
