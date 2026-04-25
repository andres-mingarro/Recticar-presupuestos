"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { FormErrorMessage } from "@/components/ui/FormErrorMessage";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";

type AddCategoriaFormState = {
  error: string | null;
  resetKey?: number;
  [key: string]: unknown;
};

type AddCategoriaFormProps = {
  action: (state: AddCategoriaFormState, formData: FormData) => Promise<AddCategoriaFormState>;
  placeholder?: string;
  submitLabel?: string;
  pendingLabel?: string;
};

export function AddCategoriaForm({
  action,
  placeholder = "Nombre de la nueva categoría…",
  submitLabel = "Nueva categoría",
  pendingLabel = "Creando…",
}: AddCategoriaFormProps) {
  const [state, formAction, isPending] = useActionState(action, {
    error: null,
    resetKey: 0,
  });

  return (
    <div className="AddCategoriaForm space-y-2">
      <form
        key={state.resetKey ?? 0}
        action={formAction}
        className="flex flex-col gap-2 rounded-[18px] bg-[var(--color-info-bg)] px-4 py-3 sm:flex-row sm:gap-3"
        style={{ border: "2px dashed var(--color-info-border-strong)" }}
      >
        <input
          type="text"
          name="nombre"
          placeholder={placeholder}
          required
          className="flex-1 rounded-xl border border-[var(--color-info-border)] bg-white/80 px-4 py-2 text-sm text-[var(--text-color-defult)] placeholder:text-[var(--color-info-border-strong)] focus:border-[var(--color-info-border-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--color-info-border)]/40"
        />
        <Button
          type="submit"
          disabled={isPending}
          className="uppercase bg-[var(--color-info-text)] text-white hover:bg-[var(--color-info-text-strong)]"
          icon={isPending ? <Spinner className="h-4 w-4" /> : <Icon name="plus" className="h-4 w-4" />}
        >
          {isPending ? pendingLabel : submitLabel}
        </Button>
      </form>
      <FormErrorMessage error={state.error} className="text-sm" />
    </div>
  );
}
