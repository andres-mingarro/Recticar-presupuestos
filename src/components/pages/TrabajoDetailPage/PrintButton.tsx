"use client";

import { Button } from "@/components/ui/Button";
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
    <Button
      type="button"
      variant="dark"
      onClick={startPrintMode}
      className="PrintButton w-full"
      icon={<Icon name="printer" className="size-4" />}
    >
      IMPRIMIR ETIQUETA
    </Button>
  );
}
