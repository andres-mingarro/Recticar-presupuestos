"use client";

import { Button } from "@/components/ui/Button";

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
      onClick={startPrintMode}
      className="print:hidden mt-6"
    >
      Imprimir etiqueta
    </Button>
  );
}
