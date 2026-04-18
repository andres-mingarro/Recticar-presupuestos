import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import styles from "./Textarea.module.scss";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "Textarea",
        styles.Textarea,
        "min-h-28 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-3 text-sm text-[var(--text-color-defult)] outline-none transition placeholder:text-[var(--text-color-ligth)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)]",
        className
      )}
      {...props}
    />
  );
}
