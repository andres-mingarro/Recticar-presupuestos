"use client";

import { useState } from "react";
import type { TechnicalActionState } from "@/app/(app)/informacion-tecnica/actions";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Icon } from "@/components/ui/Icon";

export type ActionFn = (
  state: TechnicalActionState,
  formData: FormData
) => Promise<TechnicalActionState>;

// ─── Field class helpers ──────────────────────────────────────────────────────

export const fieldCls =
  "rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5 text-sm text-[var(--text-color-defult)] transition focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 disabled:opacity-60";

export const readCls =
  "px-2 py-1.5 text-sm font-medium text-[var(--text-color-defult)]";

export const addFieldCls =
  "rounded-xl border border-[var(--color-info-border)] bg-white/80 px-3 py-1.5 text-sm placeholder:text-[var(--color-info-border-strong)] focus:border-[var(--color-info-border-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--color-info-border)]/40";

export const saveRowBtnCls =
  "shrink-0 whitespace-nowrap rounded-lg border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--text-color-gray)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-40";

export const addBtnClassName =
  "gap-2 !text-white bg-[var(--color-info-text)] uppercase hover:bg-[var(--color-info-text-strong)] whitespace-nowrap shrink-0";

// ─── Shared components ────────────────────────────────────────────────────────

export function AddFooter({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex flex-wrap items-start gap-3 bg-[var(--color-info-bg)] px-4 py-3"
      style={{ borderTop: "2px dashed var(--color-info-border-strong)" }}
    >
      {children}
    </div>
  );
}

export function RowError({ error }: { error: string | null | undefined }) {
  if (!error) return null;
  return (
    <p className="pb-2 pl-4 text-xs text-[var(--color-danger-text)]">{error}</p>
  );
}

export function ColHeaders({ cols }: { cols: Array<{ label: string; className?: string }> }) {
  return (
    <div className="flex items-center gap-2">
      {cols.map(({ label, className }) => (
        <span
          key={label}
          className={cn(
            "text-[11px] font-semibold uppercase tracking-wider text-[var(--text-color-gray)]",
            className
          )}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

export function DeleteButton({ form, disabled, label }: { form: string; disabled?: boolean; label?: string }) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    setOpen(false);
    const el = document.getElementById(form) as HTMLFormElement | null;
    el?.requestSubmit();
  };

  return (
    <>
      <Button
        type="button"
        disabled={disabled}
        variant="outline-ghost"
        title="Eliminar"
        className="shrink-0 h-auto p-1.5"
        icon={<Icon name="trash" className="h-4 w-4" />}
        onClick={() => setOpen(true)}
      />
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="¿Eliminar?"
        description={label ? `Vas a eliminar "${label}". Esta acción no se puede deshacer.` : "Esta acción no se puede deshacer."}
        onConfirm={handleConfirm}
        loading={disabled}
      />
    </>
  );
}
