"use client";

import { cn } from "@/lib/cn";
import { useCobrado } from "./CobradoContext";

type CobradoToggleProps = {
  form?: string;
};

export function CobradoToggle({ form }: CobradoToggleProps) {
  const { cobrado, setCobrado } = useCobrado();

  return (
    <div className="CobradoToggle flex-1 flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-foreground-muted)]">Cobro</span>
      <input type="hidden" name="cobrado" value={String(cobrado)} form={form} />
      <div className="flex w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-1.5">
        <button
          type="button"
          onClick={() => setCobrado(false)}
          className={cn(
            "flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition focus:outline-none",
            !cobrado
              ? "border-red-600 bg-[linear-gradient(135deg,#dc2626,#f87171)] text-white shadow-[0_10px_24px_rgba(220,38,38,0.28)]"
              : "border-transparent bg-transparent text-[var(--color-foreground-muted)] hover:bg-white hover:text-[var(--color-foreground)]"
          )}
        >
          No cobrado
        </button>
        <button
          type="button"
          onClick={() => setCobrado(true)}
          className={cn(
            "flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition focus:outline-none",
            cobrado
              ? "border-emerald-600 bg-[linear-gradient(135deg,#059669,#34d399)] text-white shadow-[0_10px_24px_rgba(5,150,105,0.28)]"
              : "border-transparent bg-transparent text-[var(--color-foreground-muted)] hover:bg-white hover:text-[var(--color-foreground)]"
          )}
        >
          Cobrado
        </button>
      </div>
    </div>
  );
}
