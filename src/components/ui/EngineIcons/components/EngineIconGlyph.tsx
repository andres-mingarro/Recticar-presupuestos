"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";
import { formatEngineIconLabel, getEngineIconSrc, type EngineIconName } from "./engine-icons.data";
import styles from "../EngineIcons.module.scss";

type EngineIconGlyphProps = {
  name: EngineIconName;
  className?: string;
  imageClassName?: string;
  /** El ícono es un SVG negro fijo. Por default se invierte a blanco en modo
   * oscuro (ver EngineIcons.module.scss). Pasar `true` cuando el fondo detrás
   * del ícono es siempre claro a propósito (ej: tarjetas del selector) — ahí
   * invertir lo volvería a hacer invisible, esta vez blanco sobre claro. */
  fixedColor?: boolean;
};

export function EngineIconGlyph({
  name,
  className,
  imageClassName,
  fixedColor = false,
}: EngineIconGlyphProps) {
  return (
    <span
      className={cn(
        "EngineIconGlyph",
        className
      )}
    >
      <Image
        src={getEngineIconSrc(name)}
        alt={formatEngineIconLabel(name)}
        width={28}
        height={28}
        className={cn(
          "EngineIconGlyphImage w-full object-contain",
          styles.EngineIconGlyphImage,
          fixedColor && styles.EngineIconGlyphImageFixed,
          imageClassName
        )}
        unoptimized
      />
    </span>
  );
}
