import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ClienteDetailPage } from "@/components/pages/ClienteDetailPage";
import type { ClienteFormState } from "@/components/forms/ClienteForm";
import { getClienteById, updateCliente } from "@/lib/queries/clientes";
import { listTrabajosByCliente } from "@/lib/queries/trabajos";
import type { ClienteFormValues } from "@/lib/types";

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
  const clienteId = Number(id);

  if (Number.isNaN(clienteId)) {
    notFound();
  }

  const session = await getSession();
  const canEdit = session?.role !== "operador";

  const [cliente, trabajos] = await Promise.all([
    getClienteById(clienteId),
    listTrabajosByCliente(clienteId),
  ]);

  if (!cliente) {
    notFound();
  }

  const trabajosVigentes = trabajos.filter(
    (trabajo) => trabajo.estado === "pendiente" || trabajo.estado === "aprobado"
  );
  const trabajosFinalizados = trabajos.filter(
    (trabajo) => trabajo.estado === "finalizado"
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
      wasCreated={query?.created === "1"}
      wasUpdated={query?.updated === "1"}
      trabajosVigentes={trabajosVigentes}
      trabajosFinalizados={trabajosFinalizados}
      canEdit={canEdit}
    />
  );
}
