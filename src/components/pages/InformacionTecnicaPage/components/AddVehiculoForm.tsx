"use client";

import { useActionState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { type ActionFn, addBtnClassName, AddFooter } from "./shared";

export function AddVehiculoForm({ action }: { action: ActionFn }) {
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
        <SearchableSelect
          name="modeloId"
          searchType="modelos"
          required
          disabled={isPending}
          placeholder="Buscar modelo…"
          className="min-w-0 flex-1"
        />
        <SearchableSelect
          name="motorId"
          searchType="motores"
          required
          disabled={isPending}
          placeholder="Buscar motor…"
          className="w-52 shrink-0"
        />
        <Button type="submit" disabled={isPending} className={addBtnClassName} icon={isPending ? <Spinner className="h-4 w-4" /> : <Icon name="plus" className="h-4 w-4" />}>
          {isPending ? "Agregando…" : "Agregar relación"}
        </Button>
      </form>
      {state.error && (
        <p className="w-full text-xs text-[var(--color-danger-text)]">{state.error}</p>
      )}
    </AddFooter>
  );
}
