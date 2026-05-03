"use client";

import { useActionState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useErrorNotification } from "@/components/ui/NotificationToast";
import { type ActionFn, addBtnClassName, AddFooter } from "./shared";

export function AddVehiculoForm({ action }: { action: ActionFn }) {
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
        <SearchableSelect
          name="modeloId"
          searchType="modelos"
          searchMode="nameOnly"
          required
          disabled={isPending}
          placeholder="Buscar modelo…"
          className="w-full sm:min-w-0 sm:flex-1"
        />
        <SearchableSelect
          name="motorId"
          searchType="motores"
          required
          disabled={isPending}
          placeholder="Buscar motor…"
          className="w-full sm:w-52 sm:shrink-0"
        />
        <Button type="submit" disabled={isPending} className={cn("w-full sm:w-auto", addBtnClassName)} icon={isPending ? <Spinner className="h-4 w-4" /> : <Icon name="plus" className="h-4 w-4" />}>
          {isPending ? "Agregando…" : "Agregar relación"}
        </Button>
      </form>
    </AddFooter>
  );
}
