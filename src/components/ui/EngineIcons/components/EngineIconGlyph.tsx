"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";
import { formatEngineIconLabel, getEngineIconSrc, type EngineIconName } from "./engine-icons.data";

type EngineIconGlyphProps = {
  name: EngineIconName;
  className?: string;
  imageClassName?: string;
};

export function EngineIconGlyph({
  name,
  className,
  imageClassName,
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
        className={cn("EngineIconGlyphImage w-full object-contain", imageClassName)}
        unoptimized
      />
    </span>
  );
}
