"use client";

import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { CheckboxBeauti } from "@/components/ui/CheckboxBeauti";
import styles from "./PedidoItemCard.module.scss";

type PedidoItemCardProps = {
  checked: boolean;
  label: ReactNode;
  value: string | number;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  contentClassName?: string;
  checkboxClassName?: string;
  children?: ReactNode;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "checked" | "value" | "onChange">;

export function PedidoItemCard({
  checked,
  label,
  value,
  onCheckedChange,
  className,
  contentClassName,
  checkboxClassName,
  children,
  ...inputProps
}: PedidoItemCardProps) {
  const inputId = useId();

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "PedidoItemCard rounded-xl px-4 py-3 text-sm ",
        checked ? "text-white" : "text-[var(--color-foreground)]",
        styles.PedidoItemCard,
        checked ? styles.PedidoItemCardChecked : styles.PedidoItemCardUnchecked,
        className
      )}
    >
      <div className={cn("flex items-start  flex-col lg:flex-row lg:items-center justify-between gap-3", styles.PedidoItemCardContent, contentClassName)}>
        <div className="content-pedido-item-header flex items-center gap-3">
        <CheckboxBeauti
          {...inputProps}
          id={inputId}
          value={value}
          checked={checked}
          onChange={(event) => onCheckedChange(event.target.checked)}
          className={cn("gap-0", checkboxClassName)}
        />
        <span className="min-w-0 text-lg">{label}</span>
        </div>
        {children}
      </div>
    </label>
  );
}
