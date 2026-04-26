"use client";

import { useState, useRef, useCallback, type CSSProperties } from "react";
import { cn } from "@/lib/cn";

// Formatea un número como $ 1.000.000 (sin decimales, separador de miles con punto)
function formatDisplay(value: number): string {
  if (value === 0) return "";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Extrae el número crudo de un string con formato
function parseRaw(str: string): number {
  const digits = str.replace(/[^\d]/g, "");
  const n = parseInt(digits, 10);
  return Number.isFinite(n) ? n : 0;
}

type Props = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  style?: CSSProperties;
};

export function PriceInput({ value, onChange, disabled, className, placeholder, style }: Props) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const safeValue = Number.isFinite(value) ? value : 0;

  // En foco: mostrar solo el número sin formato para editar fácil
  const displayValue = focused
    ? safeValue === 0 ? "" : String(safeValue)
    : formatDisplay(safeValue);

  const handleFocus = useCallback(() => {
    setFocused(true);
    // Seleccionar todo al enfocar
    setTimeout(() => inputRef.current?.select(), 0);
  }, []);

  const handleBlur = useCallback(() => {
    setFocused(false);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = parseRaw(e.target.value);
      onChange(raw);
    },
    [onChange]
  );

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      disabled={disabled}
      placeholder={placeholder ?? "$ 0"}
      style={style}
      className={cn(
        "PriceInput h-9 w-[120] rounded-xl border border-[var(--color-border)] bg-white px-3 text-right text-sm text-[var(--text-color-defult)] outline-none transition placeholder:text-[var(--text-color-ligth)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)] disabled:opacity-50",
        className
      )}
    />
  );
}
