"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import styles from "./NotificationToast.module.scss";

type NotificationToastProps = {
  title: string;
  description?: string;
};

export function NotificationToast({ title, description }: NotificationToastProps) {
  return (
    <div className={cn("NotificationToast", styles.NotificationToast)}>
      <p className={styles.title}>{title}</p>
      {description ? <p className={styles.description}>{description}</p> : null}
    </div>
  );
}

export function notifyError(title: string, description?: string) {
  return toast.error(<NotificationToast title={title} description={description} />);
}

export function notifySuccess(title: string, description?: string) {
  return toast.success(<NotificationToast title={title} description={description} />);
}

export function notifyMessage(title: string, description?: string) {
  return toast.message(<NotificationToast title={title} description={description} />);
}

export function useErrorNotification(
  error: string | null | undefined,
  key?: string | number | null
) {
  const lastToastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!error) {
      lastToastKeyRef.current = null;
      return;
    }

    const toastKey = `${error}:${key ?? ""}`;
    if (lastToastKeyRef.current === toastKey) return;
    lastToastKeyRef.current = toastKey;

    notifyError(error);
  }, [error, key]);
}
