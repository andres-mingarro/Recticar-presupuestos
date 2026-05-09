"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  loading?: boolean;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  onConfirm,
  loading = false,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="centered">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-border)]">
              <Icon name="trash" className="size-5 text-[var--color-overlay)]" />
            </span>
            <DialogTitle>{title}</DialogTitle>
          </div>
        </DialogHeader>
        {description && (
          <p className="px-5 py-4 text-sm text-[var(--text-color-gray)]">{description}</p>
        )}
        <DialogFooter className="items-stretch">
          <Button
            variant="outline-dark"
            className="h-auto min-h-11 flex-1 whitespace-normal px-3 py-2 text-center leading-5"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant="dark"
            className="h-auto min-h-11 flex-1 whitespace-normal px-3 py-2 text-center leading-5"
            onClick={onConfirm}
            disabled={loading}
            icon={loading ? undefined : <Icon name="trash" className="size-4" />}
          >
            {loading ? "Eliminando…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
