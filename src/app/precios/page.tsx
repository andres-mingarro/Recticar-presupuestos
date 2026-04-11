import { revalidatePath } from "next/cache";
import { PreciosPage } from "@/components/pages/PreciosPage";
import {
  listTrabajosAgrupados,
  updateTrabajoPrecios,
} from "@/lib/queries/catalogo";

export const dynamic = "force-dynamic";

type PreciosFormState = { error: string | null; success: boolean };

export default async function Page() {
  const trabajos = await listTrabajosAgrupados();

  async function updatePreciosAction(
    _previousState: PreciosFormState,
    formData: FormData
  ): Promise<PreciosFormState> {
    "use server";

    const updates: Array<{ id: number; precio: number }> = [];

    for (const [key, value] of formData.entries()) {
      if (!key.startsWith("precio_")) continue;

      const id = Number(key.replace("precio_", ""));
      const precio = Number(value);

      if (Number.isNaN(id) || Number.isNaN(precio) || precio < 0) continue;

      updates.push({ id, precio });
    }

    if (updates.length === 0) {
      return { error: "No se encontraron precios para actualizar.", success: false };
    }

    try {
      await updateTrabajoPrecios(updates);
    } catch {
      return {
        error: "No se pudieron guardar los precios. Probá nuevamente.",
        success: false,
      };
    }

    revalidatePath("/precios");
    return { error: null, success: true };
  }

  return <PreciosPage trabajos={trabajos} action={updatePreciosAction} />;
}
