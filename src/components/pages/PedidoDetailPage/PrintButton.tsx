"use client";

import { buttonStyles } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

function startPrintMode() {
  const body = document.body;
  body.classList.add("print-etiqueta");
  const cleanup = () => body.classList.remove("print-etiqueta");

  window.addEventListener("afterprint", cleanup, { once: true });
  window.print();
}

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={startPrintMode}
      className={buttonStyles({ variant: "dark", className: "PrintButton w-full gap-2" })}
    >
      <Icon name="printer" className="h-4 w-4" />
      IMPRIMIR ETIQUETA
    </button>
  );
}
