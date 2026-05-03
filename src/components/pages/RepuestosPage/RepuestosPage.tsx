"use client";

import { useState } from "react";
import type { RepuestosActionState } from "@/app/(app)/repuestos/actions";
import { AddCategoriaForm } from "@/components/forms/AddCategoriaForm";
import type { RepuestoAgrupado } from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { PdfShareButton } from "@/components/ui/PdfShareButton";
import { ShimmerHighlight } from "@/components/ui/ShimmerHighlight";
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
  const [highlightedCategoriaId, setHighlightedCategoriaId] = useState<number | null>(null);

  return (
    <div className="RepuestosPage space-y-6">
      <PageHeader
        eyebrow="Configuración"
        title="Repuestos"
        description={`${totalRepuestos} repuestos en ${repuestos.length} categorías.`}
        actions={
          <PdfShareButton
            href="/api/repuestos/pdf"
            filename="catalogo-repuestos.pdf"
            variant="warm"
            size="md"
          >
            Descargar PDF
          </PdfShareButton>
        }
      />

      <div className="space-y-4">
        {repuestos.map((grupo) => {
          const highlighted = highlightedCategoriaId === grupo.categoriaId;

          return (
            <ShimmerHighlight key={grupo.categoriaId} active={highlighted}>
              <CategoriaCard
                grupo={grupo}
                deleteCategoriaAction={deleteCategoriaAction}
                createRepuestoAction={createRepuestoAction}
                deleteRepuestoAction={deleteRepuestoAction}
                reorderRepuestosAction={reorderRepuestosAction}
                updateCategoriaAction={updateCategoriaAction}
                onHighlightDismiss={() => setHighlightedCategoriaId(null)}
              />
            </ShimmerHighlight>
          );
        })}
      </div>

      <AddCategoriaForm
        action={createCategoriaAction}
        onCreatedCategoria={setHighlightedCategoriaId}
      />
    </div>
  );
}
