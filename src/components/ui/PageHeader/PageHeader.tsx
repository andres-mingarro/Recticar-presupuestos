import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "./PageHeader.module.scss";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "PageHeader",
        styles.PageHeader,
        "flex flex-col items-start gap-4 rounded-[28px] border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(255,247,237,0.88))] p-5 shadow-[0_20px_70px_rgba(148,163,184,0.18)] sm:p-6 md:flex-row md:items-center md:justify-between md:gap-6",
        className
      )}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
          {eyebrow}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
          {title}
        </h1>
        {description && (
          <div className="text-sm leading-6 text-[var(--color-foreground-muted)]">
            {description}
          </div>
        )}
      </div>
      {actions ? (
        <div className="flex w-full shrink-0 flex-wrap gap-3 md:w-auto md:justify-end">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
