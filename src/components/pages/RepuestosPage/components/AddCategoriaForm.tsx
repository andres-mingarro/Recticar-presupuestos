"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { addInputCls, type RepuestosActionFn } from "./shared";

export function AddCategoriaForm({ action }: { action: RepuestosActionFn }) {
  const [state, formAction, isPending] = useActionState(action, { error: null, resetKey: 0 });

  return (
    <div className="AddCategoriaForm space-y-2">
      <form
        key={state.resetKey ?? 0}
        action={formAction}
        className="flex gap-3 rounded-[18px] bg-[var(--color-info-bg)] px-4 py-3"
        style={{ border: "2px dashed var(--color-info-border-strong)" }}
      >
        <input
          type="text"
          name="nombre"
          placeholder="Nombre de la nueva categoría…"
          required
          className={`flex-1 ${addInputCls}`}
        />
        <Button
          type="submit"
          disabled={isPending}
          className="uppercase bg-[var(--color-info-text)] text-white hover:bg-[var(--color-info-text-strong)]"
          icon={isPending ? <Spinner className="h-4 w-4" /> : <Icon name="plus" className="h-4 w-4" />}
        >
          {isPending ? "Creando…" : "Nueva categoría"}
        </Button>
      </form>
      {state.error && (
        <p className="text-sm text-[var(--color-danger-text)]">{state.error}</p>
      )}
    </div>
  );
}
