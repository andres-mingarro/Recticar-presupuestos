"use client";

import { cn } from "@/lib/cn";
import { useCobrado } from "./CobradoContext";

type CobradoToggleProps = {
  form?: string;
};

export function CobradoToggle({ form }: CobradoToggleProps) {
  const { cobrado, setCobrado } = useCobrado();

  return (
    <div className="flex items-center">
      <input type="hidden" name="cobrado" value={String(cobrado)} form={form} />
      <div className="inline-flex overflow-hidden rounded-xl border border-[var(--color-border)] text-sm font-medium">
        <button
          type="button"
          onClick={() => setCobrado(false)}
          className={cn(
            "px-4 py-2 transition-colors",
            !cobrado
              ? "bg-red-600 text-white font-semibold"
              : "bg-[var(--color-surface)] text-[var(--color-foreground-muted)] hover:bg-[var(--color-surface-alt)]"
          )}
        >
          No cobrado
        </button>
        <div className="w-px bg-[var(--color-border)]" />
        <button
          type="button"
          onClick={() => setCobrado(true)}
          className={cn(
            "px-4 py-2 transition-colors",
            cobrado
              ? "bg-emerald-600 text-white font-semibold"
              : "bg-[var(--color-surface)] text-[var(--color-foreground-muted)] hover:bg-[var(--color-surface-alt)]"
          )}
        >
          Cobrado
        </button>
      </div>
    </div>
  );
}
