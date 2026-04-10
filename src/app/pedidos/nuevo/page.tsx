import { redirect } from "next/navigation";
import { NuevoPedidoPage } from "@/components/pages/NuevoPedidoPage";
import type { PedidoFormState } from "@/components/forms/PedidoForm";
import {
  listMarcas,
  listModeloMotorRelations,
  listModelos,
  listMotores,
  listTrabajosAgrupados,
} from "@/lib/queries/catalogo";
import { listClientes } from "@/lib/queries/clientes";
import { createPedido } from "@/lib/queries/pedidos";
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
    prioridad: "normal",
    estado: "pendiente",
    observaciones: "",
    trabajosIds: [],
  },
};

function normalizeString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export default async function Page() {
  const [clientes, marcas, modelos, motores, relations, trabajos] =
    await Promise.all([
      listClientes(),
      listMarcas(),
      listModelos(),
      listMotores(),
      listModeloMotorRelations(),
      listTrabajosAgrupados(),
    ]);

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
      initialState={initialState}
      clientes={clientes}
      marcas={marcas}
      modelos={modelos}
      motores={motores}
      relations={relations}
      trabajos={trabajos}
    />
  );
}
