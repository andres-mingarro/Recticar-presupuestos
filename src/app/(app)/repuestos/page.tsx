import { RepuestosPage } from "@/components/pages/RepuestosPage";
import { listRepuestosAgrupados } from "@/lib/queries/repuestos";
import {
  createCategoriaRepuestoAction,
  createRepuestoAction,
  deleteCategoriaRepuestoAction,
  deleteRepuestoAction,
  renameCategoriaRepuestoAction,
  reorderRepuestosAction,
  updateCategoriaRepuestos,
} from "./actions";

export default async function Page() {
  const repuestos = await listRepuestosAgrupados();

  return (
    <RepuestosPage
      repuestos={repuestos}
      createCategoriaAction={createCategoriaRepuestoAction}
      renameCategoriaAction={renameCategoriaRepuestoAction}
      deleteCategoriaAction={deleteCategoriaRepuestoAction}
      createRepuestoAction={createRepuestoAction}
      deleteRepuestoAction={deleteRepuestoAction}
      reorderRepuestosAction={reorderRepuestosAction}
      updateCategoriaAction={updateCategoriaRepuestos}
    />
  );
}
