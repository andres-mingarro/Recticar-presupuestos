"use client";

import { useActionState, useRef, useState } from "react";
import type { CatalogActionState } from "@/app/(app)/precios/actions";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";

type DeleteItemFormProps = {
  itemId: number;
  action: (state: CatalogActionState, formData: FormData) => Promise<CatalogActionState>;
  idFieldName?: string;
  title?: string;
  confirmDescription?: string;
};

export function DeleteItemForm({
  itemId,
  action,
  idFieldName = "itemId",
  title = "Eliminar item",
  confirmDescription,
}: DeleteItemFormProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(action, { error: null });
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="DeleteItemForm">
      <form ref={formRef} action={formAction}>
        <input type="hidden" name={idFieldName} value={itemId} />
        <Button
          type="button"
          variant="outline-ghost"
          disabled={isPending}
          tabIndex={-1}
          title={title}
          className="h-auto p-1.5"
          onClick={() => setOpen(true)}
          icon={isPending ? <Spinner className="h-4 w-4" /> : <Icon name="trash" className="h-4 w-4" />}
        />
      </form>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="¿Eliminar?"
        description={confirmDescription ?? "Esta acción no se puede deshacer."}
        loading={isPending}
        onConfirm={() => {
          setOpen(false);
          formRef.current?.requestSubmit();
        }}
      />
      {state.error && (
        <p className="mt-1 text-xs text-[var(--color-danger-text)]">{state.error}</p>
      )}
    </div>
  );
}
