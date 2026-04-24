import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Date } from "@/components/layout/Date";
import { SiteLogo } from "@/components/layout/SiteLogo";

type Props = {
  className?: string;
  children?: ReactNode;
};

export function Header({ className, children }: Props) {
  return (
    <header
      className={cn(
        "Header z-40 lg:mx-4 lg:mt-4 px-5 py-3 flex shrink-0 items-center justify-between gap-3 lg:rounded-3xl border border-[var(--color-border)] bg-white/95 shadow-[0_4px_24px_var(--color-shadow-sm)] backdrop-blur-[10px]",
        className
      )}
    >
      <div className="flex mx-auto md:mx-0 min-w-0 items-center">
        <SiteLogo />
      </div>
      <div className="flex items-center justify-end gap-3">
        <Date className="hidden md:flex" />
        {children}
      </div>
    </header>
  );
}
