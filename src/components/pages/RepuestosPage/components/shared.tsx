"use client";

import type { RepuestosActionState } from "@/app/(app)/repuestos/actions";

export type RepuestosActionFn = (
  state: RepuestosActionState,
  formData: FormData
) => Promise<RepuestosActionState>;

export const addInputCls =
  "rounded-xl border border-[var(--color-info-border)] bg-white/80 px-3 py-1.5 text-sm placeholder:text-[var(--color-info-border-strong)] focus:border-[var(--color-info-border-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--color-info-border)]/40 backdrop-blur-sm";

export const fieldCls =
  "flex-1 rounded-lg px-2 py-1 text-sm text-[var(--text-color-defult)] transition border border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20";

export const readCls =
  "flex-1 rounded-lg px-2 py-1 text-sm font-medium text-[var(--text-color-defult)] border border-transparent bg-transparent";

export function AddFooter({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex flex-wrap items-center gap-3 bg-[var(--color-info-bg)] px-5 py-3"
      style={{ borderTop: "2px dashed var(--color-info-border-strong)" }}
    >
      {children}
    </div>
  );
}

export function RowError({ error }: { error: string | null | undefined }) {
  if (!error) return null;
  return (
    <p className="px-5 py-2 text-xs text-[var(--color-danger-text)]">{error}</p>
  );
}
