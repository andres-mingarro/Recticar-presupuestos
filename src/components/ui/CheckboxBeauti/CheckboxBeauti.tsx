"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "./CheckboxBeauti.module.scss";

type CheckboxBeautiProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: ReactNode;
};

export const CheckboxBeauti = forwardRef<HTMLInputElement, CheckboxBeautiProps>(
  function CheckboxBeauti({ className, id, label, ...props }, ref) {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    const checkboxControl = (
      <>
        <input
          {...props}
          ref={ref}
          id={inputId}
          type="checkbox"
          className={styles.CheckboxBeautiInput}
        />
        <span className={styles.CheckboxBeautiIndicator} aria-hidden="true">
          <svg viewBox="0 0 44 44" className={styles.CheckboxBeautiIcon}>
            <path d="M14,24 L21,31 L39.7428882,11.5937758 C35.2809627,6.53125861 30.0333333,4 24,4 C12.95,4 4,12.95 4,24 C4,35.05 12.95,44 24,44 C35.05,44 44,35.05 44,24 C44,19.3 42.5809627,15.1645919 39.7428882,11.5937758" transform="translate(-2.000000, -2.000000)" />
          </svg>
        </span>
      </>
    );

    if (!label) {
      return <span className={cn("CheckboxBeauti", styles.CheckboxBeauti, className)}>{checkboxControl}</span>;
    }

    return (
      <label htmlFor={inputId} className={cn("CheckboxBeauti", styles.CheckboxBeauti, className)}>
        {checkboxControl}
        <span className={styles.CheckboxBeautiLabel}>{label}</span>
      </label>
    );
  }
);
