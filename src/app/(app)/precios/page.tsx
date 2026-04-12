import { PreciosPage } from "@/components/pages/PreciosPage";
import { listTrabajosAgrupados } from "@/lib/queries/catalogo";
import {
  createCategoriaAction,
  renameCategoriaAction,
  deleteCategoriaAction,
  createTrabajoAction,
  deleteTrabajoAction,
  reorderTrabajosAction,
  updateCategoriaTrabajos,
} from "./actions";

export default async function Page() {
  const trabajos = await listTrabajosAgrupados();

  return (
    <PreciosPage
      trabajos={trabajos}
      createCategoriaAction={createCategoriaAction}
      renameCategoriaAction={renameCategoriaAction}
      deleteCategoriaAction={deleteCategoriaAction}
      createTrabajoAction={createTrabajoAction}
      deleteTrabajoAction={deleteTrabajoAction}
      reorderTrabajosAction={reorderTrabajosAction}
      updateCategoriaAction={updateCategoriaTrabajos}
    />
  );
}
