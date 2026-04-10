import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "./Table.module.scss";

export function Table({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        "Table",
        styles.Table,
        "overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]"
      )}
    >
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
