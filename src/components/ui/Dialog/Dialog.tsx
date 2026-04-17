"use client";

import * as RadixDialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import styles from "./Dialog.module.scss";

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </RadixDialog.Root>
  );
}

export function DialogContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className={styles.overlay} />
      <RadixDialog.Content
        className={cn("Dialog", styles.content, className)}
        aria-describedby={undefined}
      >
        {children}
        <RadixDialog.Close className={styles.closeButton} aria-label="Cerrar">
          <Icon name="x" className="h-5 w-5" />
        </RadixDialog.Close>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}

export function DialogHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("DialogHeader", styles.header, className)}>
      {children}
    </div>
  );
}

export function DialogTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <RadixDialog.Title
      className={cn(
        "DialogTitle",
        "text-base font-semibold tracking-tight text-[var(--color-foreground)]",
        className
      )}
    >
      {children}
    </RadixDialog.Title>
  );
}

export function DialogFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("DialogFooter", styles.footer, className)}>
      {children}
    </div>
  );
}
