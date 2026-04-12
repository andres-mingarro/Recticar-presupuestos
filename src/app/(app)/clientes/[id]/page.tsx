import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ClienteDetailPage } from "@/components/pages/ClienteDetailPage";
import type { ClienteFormState } from "@/components/forms/ClienteForm";
import { getClienteById, updateCliente } from "@/lib/queries/clientes";
import { listPedidosByCliente } from "@/lib/queries/pedidos";
import type { ClienteFormValues } from "@/lib/types";

function normalizeString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ updated?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const clienteId = Number(id);

  if (Number.isNaN(clienteId)) {
    notFound();
  }

  const session = await getSession();
  const canEdit = session?.role !== "operador";

  const [cliente, pedidos] = await Promise.all([
    getClienteById(clienteId),
    listPedidosByCliente(clienteId),
  ]);

  if (!cliente) {
    notFound();
  }

  const pedidosVigentes = pedidos.filter(
    (pedido) => pedido.estado === "pendiente" || pedido.estado === "aprobado"
  );
  const pedidosFinalizados = pedidos.filter(
    (pedido) => pedido.estado === "finalizado"
  );

  const initialState: ClienteFormState = {
    error: null,
    values: {
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      telefono: cliente.telefono ?? "",
      mail: cliente.mail ?? "",
      ciudad: cliente.ciudad ?? "Trelew",
      direccion: cliente.direccion ?? "",
      provincia: cliente.provincia ?? "Chubut",
      cp: cliente.cp ?? "",
      dni: cliente.dni ?? "",
      cuit: cliente.cuit ?? "",
    },
  };

  async function updateClienteAction(
    _previousState: ClienteFormState,
    formData: FormData
  ): Promise<ClienteFormState> {
    "use server";

    const values: ClienteFormValues = {
      nombre: normalizeString(formData.get("nombre")),
      apellido: normalizeString(formData.get("apellido")),
      telefono: normalizeString(formData.get("telefono")),
      mail: normalizeString(formData.get("mail")),
      ciudad: normalizeString(formData.get("ciudad")),
      direccion: normalizeString(formData.get("direccion")),
      provincia: normalizeString(formData.get("provincia")),
      cp: normalizeString(formData.get("cp")),
      dni: normalizeString(formData.get("dni")),
      cuit: normalizeString(formData.get("cuit")),
    };

    if (!values.nombre || !values.apellido) {
      return {
        error: "Nombre y apellido son obligatorios.",
        values,
      };
    }

    if (values.mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.mail)) {
      return {
        error: "Ingresá un email válido.",
        values,
      };
    }

    const updatedId = await updateCliente(clienteId, values);

    if (!updatedId) {
      return {
        error: "No se pudieron guardar los cambios. Probá nuevamente.",
        values,
      };
    }

    redirect(`/clientes/${clienteId}?updated=1`);
  }

  return (
    <ClienteDetailPage
      cliente={cliente}
      action={updateClienteAction}
      initialState={initialState}
      wasUpdated={query?.updated === "1"}
      pedidosVigentes={pedidosVigentes}
      pedidosFinalizados={pedidosFinalizados}
      canEdit={canEdit}
    />
  );
}
