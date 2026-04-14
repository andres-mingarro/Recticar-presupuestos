"use client";

import { buttonStyles } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={buttonStyles({ variant: "dark", className: "PrintButton w-full gap-2" })}
    >
      <Icon name="printer" className="h-4 w-4" />
      IMPRIMIR ETIQUETA
    </button>
  );
}
