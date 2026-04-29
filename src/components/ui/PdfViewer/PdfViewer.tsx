"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import styles from "./PdfViewer.module.scss";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(/Android|iPad|iPhone|iPod/.test(navigator.userAgent));
  }, []);
  return isMobile;
}

type PdfViewerProps = {
  src: string;
  title?: string;
  open: boolean;
  onClose: () => void;
};

export function PdfViewer({ src, title = "PDF", open, onClose }: PdfViewerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMobile = useIsMobile();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.fullscreenElement) onClose();
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

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      panelRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  if (!open) return null;

  return (
    <div className={styles.backdrop} onClick={onClose} aria-modal="true" role="dialog" aria-label={title}>
      <div ref={panelRef} className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <div className={styles.titleRow}>
            <Icon name="filePdf" className={styles.titleIcon} />
            <span className={styles.title}>{title}</span>
          </div>
          <div className={styles.actions}>
            <Button
              as="a"
              href={src}
              download
              variant="outline"
              size="sm"
              icon={<Icon name="download" className="h-3.5 w-3.5" />}
            >
              Descargar
            </Button>
            {!isMobile && (
              <Button variant="outline-dark" size="sm" onClick={toggleFullscreen} aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}>
                <Icon name={isFullscreen ? "compress" : "expand"} className="h-4 w-4" />
              </Button>
            )}
            <Button variant="icon-ghost" onClick={onClose} aria-label="Cerrar">
              <Icon name="x" className="h-5 w-5" />
            </Button>
          </div>
        </header>
        {isMobile ? (
          <div className={styles.iosFallback}>
            <Icon name="filePdf" className={styles.iosFallbackIcon} />
            <p className={styles.iosFallbackText}>iOS no permite previsualizar PDFs en la app.</p>
            <Button
              as="a"
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              icon={<Icon name="filePdf" className="h-4 w-4" />}
            >
              Abrir PDF
            </Button>
          </div>
        ) : (
          <div className={styles.body}>
            <iframe src={src} title={title} className={styles.iframe} />
          </div>
        )}
      </div>
    </div>
  );
}
