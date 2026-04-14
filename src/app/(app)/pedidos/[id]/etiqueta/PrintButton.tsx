"use client";

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
      className="print:hidden mt-6 rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-accent-strong)] transition-colors"
    >
      Imprimir etiqueta
    </button>
  );
}
