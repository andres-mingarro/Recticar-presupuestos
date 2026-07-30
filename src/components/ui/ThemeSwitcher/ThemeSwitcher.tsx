"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import {
  MODE_IDS,
  MODE_LABELS,
  THEMES,
  THEME_IDS,
  applyTheme,
  applyThemeMode,
  getTheme,
  themeSwatch,
  type ThemeId,
  type ThemeMode,
} from "@/lib/themes";
import styles from "./ThemeSwitcher.module.scss";

const MODE_ICONS: Record<ThemeMode, Parameters<typeof Icon>[0]["name"]> = {
  light: "eye",
  dark: "eyeSlash",
  system: "gauge",
};

export function ThemeSwatch({ id, className }: { id: ThemeId; className?: string }) {
  const [from, to] = themeSwatch(id);

  return (
    <span
      className={cn("ThemeSwatch", styles.swatch, className)}
      style={{ "--swatch-from": from, "--swatch-to": to } as CSSProperties}
      aria-hidden="true"
    />
  );
}

export function ThemeSwitcher({
  theme: initialTheme,
  mode: initialMode,
}: {
  theme: ThemeId;
  mode: ThemeMode;
}) {
  const [theme, setTheme] = useState<ThemeId>(initialTheme);
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const [open, setOpen] = useState(false);

  return (
    <div className="ThemeSwitcher">
      <button
        type="button"
        className={cn("ThemeSwitcherTrigger", styles.trigger, "size-7")}
        onClick={() => setOpen(true)}
        aria-label={`Cambiar color de la app. Actual: ${getTheme(theme).label}`}
      >
        <ThemeSwatch id={theme} className="size-full" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent variant="centered">
          <DialogHeader>
            <DialogTitle>Color de la app</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 px-5 py-4">
            <div className="flex flex-col gap-2">
              {THEME_IDS.map((id) => {
                const activo = id === theme;

                return (
                  <button
                    key={id}
                    type="button"
                    className={cn("ThemeSwitcherOption", styles.option, activo && styles.optionActive)}
                    onClick={() => {
                      setTheme(applyTheme(id));
                      setOpen(false);
                    }}
                    aria-current={activo}
                  >
                    <ThemeSwatch id={id} className="size-8 shrink-0" />
                    <span className="flex-1 text-sm font-semibold text-[var(--text-color-defult)]">
                      {THEMES[id].label}
                    </span>
                    {activo && (
                      <Icon name="check" className="size-4 shrink-0 text-[var(--color-accent)]" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-color-gray)]">
                Modo
              </span>
              <div className={cn("ThemeSwitcherModes", styles.modes)}>
                {MODE_IDS.map((id) => {
                  const activo = id === mode;

                  return (
                    <button
                      key={id}
                      type="button"
                      className={cn(styles.mode, activo && styles.modeActive)}
                      onClick={() => setMode(applyThemeMode(id))}
                      aria-pressed={activo}
                    >
                      <Icon name={MODE_ICONS[id]} className="size-4 shrink-0" />
                      {MODE_LABELS[id]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
