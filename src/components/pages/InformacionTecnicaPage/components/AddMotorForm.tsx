"use client";

import { useActionState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useErrorNotification } from "@/components/ui/NotificationToast";
import { type ActionFn, addFieldCls, addBtnClassName, AddFooter } from "./shared";

export function AddMotorForm({ action }: { action: ActionFn }) {
  const [state, formAction, isPending] = useActionState(action, {
    error: null,
    resetKey: 0,
  });
  useErrorNotification(state.error, state.resetKey);

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
          className={cn("w-full sm:min-w-0 sm:flex-1", addFieldCls)}
        />
        <input
          name="cilindrada"
          placeholder="Cilindrada (ej. 1.6)"
          disabled={isPending}
          className={cn("w-full sm:w-40 sm:shrink-0", addFieldCls)}
        />
        <Button type="submit" disabled={isPending} className={cn("w-full sm:w-auto", addBtnClassName)} icon={isPending ? <Spinner className="h-4 w-4" /> : <Icon name="plus" className="h-4 w-4" />}>
          {isPending ? "Agregando…" : "Agregar motor"}
        </Button>
      </form>
    </AddFooter>
  );
}
