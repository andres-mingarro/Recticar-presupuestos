"use client";

import { useActionState } from "react";
import type { CatalogActionState } from "@/app/(app)/precios/actions";
import { Icon } from "@/components/ui/Icon";

export function DeleteTrabajoForm({
  trabajoId,
  action,
}: {
  trabajoId: number;
  action: (state: CatalogActionState, formData: FormData) => Promise<CatalogActionState>;
}) {
  const [state, formAction, isPending] = useActionState(action, { error: null });

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="trabajoId" value={trabajoId} />
        <button
          type="submit"
          disabled={isPending}
          tabIndex={-1}
          title="Eliminar trabajo"
          className="rounded-lg p-1.5 text-[var(--color-foreground-muted)] transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
        >
          <Icon name="trash" className="h-4 w-4" />
        </button>
      </form>
      {state.error ? (
        <p className="mt-1 text-xs text-rose-600">{state.error}</p>
      ) : null}
    </div>
  );
}
