"use client";

import type { EngineIconName } from "./components/engine-icons.data";
import { EngineIconsDialog } from "./components/EngineIconsDialog";

type EngineIconsProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: EngineIconName | null;
  onSelect: (value: EngineIconName) => void;
};

export function EngineIcons(props: EngineIconsProps) {
  return <EngineIconsDialog {...props} />;
}
