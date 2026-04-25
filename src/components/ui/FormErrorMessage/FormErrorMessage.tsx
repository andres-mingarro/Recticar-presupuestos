"use client";

import { cn } from "@/lib/cn";

type FormErrorMessageProps = {
  error: string | null | undefined;
  className?: string;
};

export function FormErrorMessage({ error, className }: FormErrorMessageProps) {
  if (!error) return null;

  return (
    <p className={cn("FormErrorMessage text-xs text-[var(--color-danger-text)]", className)}>
      {error}
    </p>
  );
}
