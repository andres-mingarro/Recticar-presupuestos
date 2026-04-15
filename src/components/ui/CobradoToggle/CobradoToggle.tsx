"use client";

import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
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
            "inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition focus:outline-none",
            !cobrado
              ? "border-slate-600 bg-[linear-gradient(135deg,#64748b,#475569)] text-white shadow-[0_10px_24px_rgba(100,116,139,0.28)]"
              : "border-transparent bg-transparent text-[var(--color-foreground-muted)] hover:bg-white hover:text-[var(--color-foreground)]"
          )}
        >
          <Icon name="sackXmark" size="lg" />
          No cobrado
        </button>
        <button
          type="button"
          onClick={() => setCobrado(true)}
          className={cn(
            "inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition focus:outline-none",
            cobrado
              ? "border-emerald-600 bg-[linear-gradient(135deg,#059669,#34d399)] text-white shadow-[0_10px_24px_rgba(5,150,105,0.28)]"
              : "border-transparent bg-transparent text-[var(--color-foreground-muted)] hover:bg-white hover:text-[var(--color-foreground)]"
          )}
        >
          <Icon name="sackDollar" size="lg" />
          Cobrado
        </button>
      </div>
    </div>
  );
}
