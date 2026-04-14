"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden mt-6 rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-accent-strong)] transition-colors"
    >
      Imprimir etiqueta
    </button>
  );
}
