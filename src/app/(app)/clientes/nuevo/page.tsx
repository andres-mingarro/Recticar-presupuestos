import { redirect } from "next/navigation";
import { NuevoClientePage } from "@/components/pages/NuevoClientePage";
import type { ClienteFormValues } from "@/lib/types";
import { createCliente } from "@/lib/queries/clientes";
import type { ClienteFormState } from "@/components/forms/ClienteForm";

const initialState: ClienteFormState = {
  error: null,
  values: {
    nombre: "",
    apellido: "",
    telefono: "",
    mail: "",
    ciudad: "Trelew",
    direccion: "",
    provincia: "Chubut",
    cp: "",
    dni: "",
    cuit: "",
  },
};

function normalizeString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export default function Page() {
  async function createClienteAction(
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

    const clienteId = await createCliente(values);

    if (!clienteId) {
      return {
        error: "No se pudo crear el cliente. Probá nuevamente.",
        values,
      };
    }

    redirect(`/clientes/${clienteId}`);
  }

  return (
    <NuevoClientePage
      action={createClienteAction}
      initialState={initialState}
    />
  );
}
