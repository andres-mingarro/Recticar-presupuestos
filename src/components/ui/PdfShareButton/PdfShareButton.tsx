"use client";

import { useState } from "react";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";

type PdfShareButtonProps = {
  href: string;
  filename?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconSize?: string;
  className?: string;
  children?: React.ReactNode;
};

export function PdfShareButton({
  href,
  filename = "presupuesto.pdf",
  variant,
  size,
  iconSize = "size-4",
  className,
  children,
}: PdfShareButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    const isMobile = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (!isMobile || !navigator.canShare) return; // desktop: comportamiento default del <a>

    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(href);
      const blob = await res.blob();
      const file = new File([blob], filename, { type: "application/pdf" });

      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: filename });
      } else {
        // canShare existe pero no soporta files → descarga manual
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("Error al compartir PDF:", err);
      }
    } finally {
      setLoading(false);
    }
  }

  const icon = loading ? (
    <Spinner className={iconSize} />
  ) : (
    <Icon name="download" className={iconSize} />
  );

  if (variant !== undefined || size !== undefined) {
    return (
      <Button
        as="a"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        variant={variant}
        size={size}
        icon={icon}
        className={className}
        onClick={handleClick}
      >
        {children}
      </Button>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={handleClick}
    >
      {icon}
      {children}
    </a>
  );
}
