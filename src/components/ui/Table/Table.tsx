import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "./Table.module.scss";

export function Table({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        "Table",
        styles.Table,
        "overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[0_20px_60px_var(--color-shadow-sm)]"
      )}
    >
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
