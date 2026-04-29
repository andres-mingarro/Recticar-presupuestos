"use client";

import type { RepuestosActionState } from "@/app/(app)/repuestos/actions";
import { AddCategoriaForm } from "@/components/forms/AddCategoriaForm";
import type { RepuestoAgrupado } from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { CategoriaCard } from "./components/CategoriaCard";

type RepuestosPageProps = {
  repuestos: RepuestoAgrupado[];
  createCategoriaAction: (state: RepuestosActionState, formData: FormData) => Promise<RepuestosActionState>;
  deleteCategoriaAction: (state: RepuestosActionState, formData: FormData) => Promise<RepuestosActionState>;
  createRepuestoAction: (state: RepuestosActionState, formData: FormData) => Promise<RepuestosActionState>;
  deleteRepuestoAction: (state: RepuestosActionState, formData: FormData) => Promise<RepuestosActionState>;
  reorderRepuestosAction: (orderedIds: number[]) => Promise<void>;
  updateCategoriaAction: (state: RepuestosActionState, formData: FormData) => Promise<RepuestosActionState>;
};

export function RepuestosPage({
  repuestos,
  createCategoriaAction,
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
        actions={
          <Button
            as="a"
            href="/api/repuestos/pdf"
            target="_blank"
            rel="noopener noreferrer"
            variant="warm"
            size="md"
            icon={<Icon name="download" className="h-4 w-4" />}
          >
            Descargar PDF
          </Button>
        }
      />

      <div className="space-y-4">
        {repuestos.map((grupo) => (
          <CategoriaCard
            key={grupo.categoriaId}
            grupo={grupo}
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
