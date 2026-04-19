"use client";

import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { EngineIconGlyph } from "./EngineIconGlyph";
import {
  ENGINE_ICON_OPTIONS,
  formatEngineIconLabel,
  type EngineIconName,
} from "./engine-icons.data";
import styles from "../EngineIcons.module.scss";

type EngineIconsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: EngineIconName | null;
  onSelect: (value: EngineIconName) => void;
};

export function EngineIconsDialog({
  open,
  onOpenChange,
  value,
  onSelect,
}: EngineIconsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        variant="centered"
        className={cn(
          "EngineIconsDialog",
          styles.EngineIcons,
          "w-[min(92vw,920px)] rounded-[28px] border border-[var(--border-ligth)] bg-[var(--color-surface-raised)] p-0"
        )}
      >
        <DialogHeader className="EngineIconsHeader border-b border-[var(--border-ligth)] px-6 py-5">
          <DialogTitle className="EngineIconsTitle text-xl">Íconos de partes del motor</DialogTitle>
        </DialogHeader>

        <div className="EngineIconsGrid grid max-h-[65vh] grid-cols-3 gap-3 overflow-y-auto px-6 py-6">
          {ENGINE_ICON_OPTIONS.map((option) => {
            const selected = option === value;

            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onSelect(option);
                  onOpenChange(false);
                }}
                className={cn(
                  "EngineIconsOption",
                  "flex min-h-20 cursor-pointer flex-col items-center justify-between py-3 gap-1 rounded-[22px] border text-center transition",
                  selected
                    ? "border-[var(--color-accent)] bg-[linear-gradient(180deg,#fff7ed,#ffffff)] text-[var(--text-color-defult)] shadow-[0_14px_34px_rgba(234,88,12,0.14)]"
                    : "border-[var(--border-ligth)] bg-[linear-gradient(180deg,#ffffff,#f8fafc)] text-[var(--text-color-gray)] hover:border-[var(--gray-40)] hover:text-[var(--text-color-defult)]"
                )}
              >
                <EngineIconGlyph
                  name={option}
                  className={cn(
                    "h-12 w-12",
                    selected ? "border-[rgba(234,88,12,0.22)] bg-[linear-gradient(180deg,#fff,#ffe7d1)]" : ""
                  )}
                  imageClassName={selected ? "opacity-100" : "opacity-90"}
                />
                <span className="text-xs font-semibold tracking-tight px-2 w-full">
                  {formatEngineIconLabel(option)}
                </span>
              </button>
            );
          })}
        </div>

        <DialogFooter className="EngineIconsFooter border-t border-[var(--border-ligth)] px-6 py-4">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
