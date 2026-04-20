import { PreciosPage } from "@/components/pages/PreciosPage";
import { requirePermission } from "@/lib/permisos";
import { listTrabajosAgrupados } from "@/lib/queries/catalogo";
import {
  createCategoriaAction,
  deleteCategoriaAction,
  createTrabajoAction,
  deleteTrabajoAction,
  reorderTrabajosAction,
  updateCategoriaTrabajos,
} from "./actions";

export default async function Page() {
  await requirePermission("trabajos.editar", "/trabajos");

  const trabajos = await listTrabajosAgrupados();

  return (
    <PreciosPage
      trabajos={trabajos}
      createCategoriaAction={createCategoriaAction}
      deleteCategoriaAction={deleteCategoriaAction}
      createTrabajoAction={createTrabajoAction}
      deleteTrabajoAction={deleteTrabajoAction}
      reorderTrabajosAction={reorderTrabajosAction}
      updateCategoriaAction={updateCategoriaTrabajos}
    />
  );
}
