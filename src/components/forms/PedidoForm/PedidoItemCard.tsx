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
  children?: ReactNode;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "checked" | "value" | "onChange">;

export function PedidoItemCard({
  checked,
  label,
  value,
  onCheckedChange,
  className,
  contentClassName,
  children,
  ...inputProps
}: PedidoItemCardProps) {
  const inputId = useId();

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "PedidoItemCard rounded-xl px-4 py-3 text-sm",
        checked ? "text-white" : "text-[var(--color-foreground)]",
        styles.PedidoItemCard,
        checked ? styles.PedidoItemCardChecked : styles.PedidoItemCardUnchecked,
        className
      )}
    >
      <div className={cn("flex items-start gap-3", styles.PedidoItemCardContent, contentClassName)}>
        <CheckboxBeauti
          {...inputProps}
          id={inputId}
          value={value}
          checked={checked}
          onChange={(event) => onCheckedChange(event.target.checked)}
          className="gap-0"
        />
        <span className="min-w-0">{label}</span>
        {children}
      </div>
    </label>
  );
}
