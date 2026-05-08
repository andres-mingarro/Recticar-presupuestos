"use client";

import { cn } from "@/lib/cn";
import { useIva } from "./IvaContext";

export const IVA_PORCENTAJE = 21;

type IvaToggleProps = {
  form?: string;
};

export function IvaToggle({ form }: IvaToggleProps) {
  const { aplicaIva, setAplicaIva } = useIva();

  return (
    <div className="IvaToggle flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--text-color-defult)]">
          IVA {IVA_PORCENTAJE}% sobre mano de obra
        </p>
        <p className="text-xs text-[var(--text-color-gray)]">
          {aplicaIva ? "Incluido en el presupuesto" : "No incluido en el presupuesto"}
        </p>
      </div>
      <input type="hidden" name="aplicaIva" value={String(aplicaIva)} form={form} />
      <button
        type="button"
        role="switch"
        aria-checked={aplicaIva}
        onClick={() => setAplicaIva(!aplicaIva)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none",
          aplicaIva
            ? "bg-[linear-gradient(135deg,var(--orange-vivid),var(--color-accent))]"
            : "bg-[var(--color-border)]"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block size-5 rounded-full bg-white shadow-lg transition-transform duration-200",
            aplicaIva ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}
