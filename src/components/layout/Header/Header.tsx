import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Date } from "@/components/layout/Date";
import { SiteLogo } from "@/components/layout/SiteLogo";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import type { ThemeId, ThemeMode } from "@/lib/themes";

type Props = {
  className?: string;
  children?: ReactNode;
  theme: ThemeId;
  mode: ThemeMode;
};

export function Header({ className, children, theme, mode }: Props) {
  return (
    <header
      className={cn(
        "Header relative z-40 lg:mx-4 lg:mt-4 px-5 py-3 flex shrink-0 items-center justify-between gap-3 lg:rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-raised)]/95 shadow-[0_4px_24px_var(--color-shadow-sm)] backdrop-blur-[10px]",
        className
      )}
    >
      <div className="flex mx-auto md:mx-0 min-w-0 items-center">
        <SiteLogo />
      </div>
      {/* En mobile flota sobre el header: sacado del flujo, el logo queda
          centrado de verdad. Desde md el logo va a la izquierda y vuelve al flujo. */}
      <div className="absolute right-5 top-1/2 flex -translate-y-1/2 items-center justify-end gap-3 md:static md:translate-y-0">
        <Date className="hidden md:flex" />
        <ThemeSwitcher theme={theme} mode={mode} />
        {children}
      </div>
    </header>
  );
}
