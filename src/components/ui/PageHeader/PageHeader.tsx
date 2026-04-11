import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "./PageHeader.module.scss";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "PageHeader",
        styles.PageHeader,
        "flex flex-col gap-4 rounded-[28px] border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(255,247,237,0.88))] p-6 shadow-[0_20px_70px_rgba(148,163,184,0.18)] md:flex-row md:items-end md:justify-between"
      )}
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
          {eyebrow}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
          {title}
        </h1>
        <div className="max-w-2xl text-sm leading-6 text-[var(--color-foreground-muted)]">
          {description}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
