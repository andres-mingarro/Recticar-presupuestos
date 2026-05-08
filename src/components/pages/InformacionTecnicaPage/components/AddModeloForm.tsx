"use client";

import { useActionState } from "react";
import { cn } from "@/lib/cn";
import type { TechnicalMarca } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useErrorNotification } from "@/components/ui/NotificationToast";
import { type ActionFn, addFieldCls, addBtnClassName, AddFooter } from "./shared";
import { MarcaDialogSelect } from "./MarcaDialogSelect";

export function AddModeloForm({
  action,
  marcas,
}: {
  action: ActionFn;
  marcas: TechnicalMarca[];
}) {
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
          placeholder="Nuevo modelo..."
          required
          disabled={isPending}
          className={cn("w-full sm:min-w-0 sm:flex-1", addFieldCls)}
        />
        <MarcaDialogSelect
          name="marcaId"
          marcas={marcas}
          disabled={isPending}
          className="w-full sm:w-52 sm:shrink-0"
        />
        <Button
          type="submit"
          disabled={isPending}
          className={cn("w-full sm:w-auto", addBtnClassName)}
          icon={isPending ? <Spinner className="size-4" /> : <Icon name="plus" className="size-4" />}
        >
          {isPending ? "Agregando..." : "Agregar modelo"}
        </Button>
      </form>
    </AddFooter>
  );
}
