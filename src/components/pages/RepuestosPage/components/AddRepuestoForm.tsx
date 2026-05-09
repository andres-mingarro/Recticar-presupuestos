"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { useErrorNotification } from "@/components/ui/NotificationToast";
import { AddFooter, addInputCls, type RepuestosActionFn } from "./shared";

export function AddRepuestoForm({
  categoriaId,
  action,
}: {
  categoriaId: number;
  action: RepuestosActionFn;
}) {
  const [state, formAction, isPending] = useActionState(action, { error: null, resetKey: 0 });
  useErrorNotification(state.error, state.resetKey);

  return (
    <AddFooter>
      <form
        key={state.resetKey ?? 0}
        action={formAction}
        className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3"
      >
        <input type="hidden" name="categoriaId" value={categoriaId} />
        <input
          type="text"
          name="nombre"
          placeholder="Nombre del nuevo repuesto…"
          required
          className={`flex-1 ${addInputCls}`}
        />
        <Button
          type="submit"
          disabled={isPending}
          className="uppercase bg-[var(--color-info-text)] text-white hover:bg-[var(--color-info-text-strong)]"
          icon={isPending ? <Spinner className="size-4" /> : <Icon name="plus" className="size-4" />}
        >
          {isPending ? "Agregando…" : "Agregar repuesto"}
        </Button>
      </form>
    </AddFooter>
  );
}
