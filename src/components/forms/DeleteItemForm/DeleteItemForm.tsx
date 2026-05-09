"use client";

import { useActionState, useRef, useState } from "react";
import type { CatalogActionState } from "@/app/(app)/precios/actions";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { useErrorNotification } from "@/components/ui/NotificationToast";
import { Spinner } from "@/components/ui/Spinner";

type DeleteItemFormProps = {
  itemId: number;
  action: (state: CatalogActionState, formData: FormData) => Promise<CatalogActionState>;
  idFieldName?: string;
  title?: string;
  confirmDescription?: string;
  doubleConfirm?: boolean;
  doubleConfirmDescription?: string;
};

export function DeleteItemForm({
  itemId,
  action,
  idFieldName = "itemId",
  title = "Eliminar item",
  confirmDescription,
  doubleConfirm = false,
  doubleConfirmDescription,
}: DeleteItemFormProps) {
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [confirmedYes, setConfirmedYes] = useState(false);
  const [state, formAction, isPending] = useActionState(action, { error: null });
  const formRef = useRef<HTMLFormElement>(null);
  useErrorNotification(state.error, `${idFieldName}:${itemId}`);

  function submit() {
    formRef.current?.requestSubmit();
  }

  return (
    <div className="DeleteItemForm">
      <form ref={formRef} action={formAction}>
        <input type="hidden" name={idFieldName} value={itemId} />
        <Button
          type="button"
          variant="outline-dark"
          variantOnHover="outline-danger"
          disabled={isPending}
          tabIndex={-1}
          title={title}
          className="delete-item-form h-auto p-1.5"
          onClick={() => setOpen(true)}
          icon={isPending ? <Spinner className="size-4" /> : <Icon name="trash" className="size-4" />}
        />
      </form>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="¿Eliminar?"
        description={confirmDescription ?? "Esta acción no se puede deshacer."}
        confirmLabel={doubleConfirm ? "Continuar" : "Eliminar"}
        loading={isPending}
        onConfirm={() => {
          setOpen(false);
          if (doubleConfirm) {
            setConfirmedYes(false);
            setOpen2(true);
          } else {
            submit();
          }
        }}
      />

      {doubleConfirm && (
        <Dialog
          open={open2}
          onOpenChange={(v) => {
            if (!v) { setOpen2(false); setConfirmedYes(false); }
          }}
        >
          <DialogContent variant="centered">
            <DialogHeader>
              <DialogTitle>¿Realmente querés eliminar?</DialogTitle>
            </DialogHeader>
            <div className="px-5 py-4">
              <p className="mb-4 text-sm text-[var(--text-color-gray)]">
                {doubleConfirmDescription ?? "Esta acción no se puede deshacer."}
              </p>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline-danger"
                  onClick={() => { setOpen2(false); setConfirmedYes(false); }}
                  className="flex-1 py-5 text-xl font-bold rounded-xl"
                >
                  NO
                </Button>
                <Button
                  type="button"
                  variant={confirmedYes ? "success" : "outline-success"}
                  onClick={() => setConfirmedYes(true)}
                  className="flex-1 py-5 text-xl font-bold rounded-xl"
                >
                  SÍ
                </Button>
              </div>
            </div>
            <DialogFooter className="items-stretch">
              <Button
                type="button"
                variant="dark"
                disabled={!confirmedYes || isPending}
                className="h-auto min-h-11 flex-1 whitespace-normal px-3 py-2 text-center leading-5 disabled:opacity-40"
                onClick={() => {
                  setOpen2(false);
                  setConfirmedYes(false);
                  submit();
                }}
                icon={<Icon name="trash" className="size-4" />}
              >
                {isPending ? "Eliminando…" : "Eliminar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
