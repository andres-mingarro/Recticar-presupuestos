"use client";

import type { RepuestosActionState } from "@/app/(app)/repuestos/actions";
import type { RepuestoAgrupado } from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { CategoriaCard } from "./components/CategoriaCard";
import { AddCategoriaForm } from "./components/AddCategoriaForm";

type RepuestosPageProps = {
  repuestos: RepuestoAgrupado[];
  createCategoriaAction: (state: RepuestosActionState, formData: FormData) => Promise<RepuestosActionState>;
  renameCategoriaAction: (state: RepuestosActionState, formData: FormData) => Promise<RepuestosActionState>;
  deleteCategoriaAction: (state: RepuestosActionState, formData: FormData) => Promise<RepuestosActionState>;
  createRepuestoAction: (state: RepuestosActionState, formData: FormData) => Promise<RepuestosActionState>;
  deleteRepuestoAction: (state: RepuestosActionState, formData: FormData) => Promise<RepuestosActionState>;
  reorderRepuestosAction: (orderedIds: number[]) => Promise<void>;
  updateCategoriaAction: (state: RepuestosActionState, formData: FormData) => Promise<RepuestosActionState>;
};

export function RepuestosPage({
  repuestos,
  createCategoriaAction,
  renameCategoriaAction,
  deleteCategoriaAction,
  createRepuestoAction,
  deleteRepuestoAction,
  reorderRepuestosAction,
  updateCategoriaAction,
}: RepuestosPageProps) {
  const totalRepuestos = repuestos.reduce((sum, g) => sum + g.repuestos.length, 0);

  return (
    <div className="RepuestosPage space-y-6">
      <PageHeader
        eyebrow="Configuración"
        title="Repuestos"
        description={`${totalRepuestos} repuestos en ${repuestos.length} categorías.`}
      />

      <div className="space-y-4">
        {repuestos.map((grupo) => (
          <CategoriaCard
            key={grupo.categoriaId}
            grupo={grupo}
            renameCategoriaAction={renameCategoriaAction}
            deleteCategoriaAction={deleteCategoriaAction}
            createRepuestoAction={createRepuestoAction}
            deleteRepuestoAction={deleteRepuestoAction}
            reorderRepuestosAction={reorderRepuestosAction}
            updateCategoriaAction={updateCategoriaAction}
          />
        ))}
      </div>

      <AddCategoriaForm action={createCategoriaAction} />
    </div>
  );
}
