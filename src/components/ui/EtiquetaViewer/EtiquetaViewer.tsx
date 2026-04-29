"use client";

import { useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import styles from "./EtiquetaViewer.module.scss";

type EtiquetaViewerProps = {
  open: boolean;
  onClose: () => void;
  pdfHref: string;
  children: React.ReactNode;
};

export function EtiquetaViewer({ open, onClose, pdfHref, children }: EtiquetaViewerProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className={styles.backdrop} onClick={onClose} aria-modal="true" role="dialog" aria-label="Etiqueta QR">
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <div className={styles.titleRow}>
            <Icon name="qrCode" className={styles.titleIcon} />
            <span className={styles.title}>Etiqueta QR</span>
          </div>
          <div className={styles.actions}>
            <Button
              as="a"
              href={pdfHref}
              download
              variant="outline"
              size="sm"
              icon={<Icon name="download" className="h-3.5 w-3.5" />}
            >
              Descargar
            </Button>
            <Button
              as="a"
              href={pdfHref}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              size="sm"
              icon={<Icon name="printer" className="h-3.5 w-3.5" />}
            >
              Imprimir
            </Button>
            <Button variant="icon-ghost" onClick={onClose} aria-label="Cerrar">
              <Icon name="x" className="h-5 w-5" />
            </Button>
          </div>
        </header>
        <div className={styles.body}>
          {children}
        </div>
      </div>
    </div>
  );
}
