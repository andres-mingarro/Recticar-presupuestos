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
  children,
  ...inputProps
}: TrabajoItemCardProps) {
  const inputId = useId();
  const hasChildren = Boolean(children);

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
        {/* Checkbox + nombre — solo esta fila es clickeable */}
        <div className={cn("flex items-center gap-3 header-card cursor-pointer", !hasChildren && "justify-between")}>
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
        {/* Controles opcionales debajo */}
        {children}
      </div>
    </div>
  );
}
