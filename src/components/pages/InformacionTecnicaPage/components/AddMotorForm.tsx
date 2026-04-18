"use client";

import { useActionState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { type ActionFn, addFieldCls, addBtnClassName, AddFooter } from "./shared";

export function AddMotorForm({ action }: { action: ActionFn }) {
  const [state, formAction, isPending] = useActionState(action, {
    error: null,
    resetKey: 0,
  });
  return (
    <AddFooter>
      <form
        key={state.resetKey ?? 0}
        action={formAction}
        className="flex flex-1 flex-wrap items-center gap-3"
      >
        <input
          name="nombre"
          placeholder="Nuevo motor…"
          required
          disabled={isPending}
          className={cn("min-w-0 flex-1", addFieldCls)}
        />
        <input
          name="cilindrada"
          placeholder="Cilindrada (ej. 1.6)"
          disabled={isPending}
          className={cn("w-40 shrink-0", addFieldCls)}
        />
        <Button type="submit" disabled={isPending} className={addBtnClassName} icon={isPending ? <Spinner className="h-4 w-4" /> : <Icon name="plus" className="h-4 w-4" />}>
          {isPending ? "Agregando…" : "Agregar motor"}
        </Button>
      </form>
      {state.error && (
        <p className="w-full text-xs text-[var(--color-danger-text)]">{state.error}</p>
      )}
    </AddFooter>
  );
}
