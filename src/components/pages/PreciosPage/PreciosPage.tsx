"use client";

import { useActionState } from "react";
import { cn } from "@/lib/cn";
import type { TrabajoAgrupado } from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { buttonStyles } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

type PreciosFormState = {
  error: string | null;
  success: boolean;
};

type PreciosPageProps = {
  trabajos: TrabajoAgrupado[];
  action: (state: PreciosFormState, formData: FormData) => Promise<PreciosFormState>;
};

const initialState: PreciosFormState = { error: null, success: false };

function formatPrecio(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(value);
}

export function PreciosPage({ trabajos, action }: PreciosPageProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  const totalTrabajos = trabajos.reduce((sum, g) => sum + g.trabajos.length, 0);

  return (
    <div className="PreciosPage space-y-6">
      <PageHeader
        eyebrow="Configuración"
        title="Lista de precios"
        description={`${totalTrabajos} trabajos en ${trabajos.length} categorías. Los precios se usan en los PDFs de presupuesto.`}
      />

      {state.success ? (
        <section className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          Los precios se actualizaron correctamente.
        </section>
      ) : null}

      {state.error ? (
        <section className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {state.error}
        </section>
      ) : null}

      <form action={formAction} className="space-y-4">
        {trabajos.map((grupo) => (
          <Card key={grupo.categoriaId} as="section" className="space-y-0 overflow-hidden p-0">
            {/* Category header */}
            <div className="flex items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface-alt)] px-5 py-3">
              <Icon name="tag" className="h-4 w-4 text-[var(--color-accent)]" />
              <h2 className="text-sm font-semibold text-[var(--color-foreground)]">
                {grupo.categoriaNombre}
              </h2>
              <span className="ml-auto text-xs text-[var(--color-foreground-muted)]">
                {grupo.trabajos.length} {grupo.trabajos.length === 1 ? "trabajo" : "trabajos"}
              </span>
            </div>

            {/* Trabajos rows */}
            <div className="divide-y divide-[var(--color-border)]">
              {grupo.trabajos.map((trabajo, index) => (
                <div
                  key={trabajo.id}
                  className={cn(
                    "flex items-center gap-4 px-5 py-3",
                    index % 2 === 1 && "bg-[var(--color-surface-alt)]/40"
                  )}
                >
                  <span className="flex-1 text-sm text-[var(--color-foreground)]">
                    {trabajo.nombre}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--color-foreground-muted)]">$</span>
                    <input
                      type="number"
                      name={`precio_${trabajo.id}`}
                      defaultValue={trabajo.precio}
                      min="0"
                      step="0.01"
                      className="w-32 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-right text-sm font-medium text-[var(--color-foreground)] transition focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
                    />
                    <span className="w-28 text-right text-xs text-[var(--color-foreground-muted)]">
                      {formatPrecio(trabajo.precio)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}

        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit" className={buttonStyles()} disabled={isPending}>
            <Icon name="check" className="h-4 w-4" />
            {isPending ? "Guardando precios..." : "Guardar precios"}
          </button>
        </div>
      </form>
    </div>
  );
}
