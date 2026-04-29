"use client";

import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { CheckboxBeauti } from "@/components/ui/CheckboxBeauti";
import styles from "./TrabajoItemCard.module.scss";

type TrabajoItemCardProps = {
  checked: boolean;
  label: ReactNode;
  value: string | number;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  contentClassName?: string;
  checkboxClassName?: string;
  /** Precio formateado para mostrar en la fila del checkbox (puede incluir xN cuando hay cantidad) */
  precioLabel?: string;
  /** Cuando hay children, el nombre ocupa su fila completa y los children van debajo */
  children?: ReactNode;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "checked" | "value" | "onChange">;

export function TrabajoItemCard({
  checked,
  label,
  value,
  onCheckedChange,
  className,
  contentClassName,
  checkboxClassName,
  precioLabel,
  children,
  ...inputProps
}: TrabajoItemCardProps) {
  const inputId = useId();

  return (
    <div
      className={cn(
        "TrabajoItemCard rounded-xl px-4 py-3 text-sm",
        styles.TrabajoItemCard,
        checked ? styles.TrabajoItemCardChecked : styles.TrabajoItemCardUnchecked,
        className
      )}
    >
      <div className={cn("flex flex-col gap-2", styles.TrabajoItemCardContent, contentClassName)}>
        {/* Mobile: dos filas. Desktop: una sola fila */}
        <div className="flex flex-col gap-2 md:gap-3 header-card cursor-pointer">
          {/* Fila 1 (mobile) / inline (desktop): checkbox + label */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <CheckboxBeauti
              {...inputProps}
              id={inputId}
              value={value}
              checked={checked}
              onChange={(event) => onCheckedChange(event.target.checked)}
              className={cn("cursor-pointer gap-0 shrink-0 ", checkboxClassName)}
            />
            <label
              htmlFor={inputId}
              className="cursor-pointer min-w-0 flex-1 text-base font-medium capitalize leading-snug"
            >
              {label}
            </label>
          </div>
          {/* Fila 2 (mobile) / inline (desktop): incrementor + precio */}
          {(children || precioLabel) && (
            <div className="flex items-center justify-between gap-3 pl-0 md:shrink-0">
              {children}
              {precioLabel && (
                <span className="min-w-[100] ml-auto shrink-0 text-sm text-right font-semibold text-[var(--brown-burnt)]">
                  {precioLabel}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
