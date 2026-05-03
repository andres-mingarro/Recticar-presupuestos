"use client";

import { LISTAS_PRECIOS, type ListaPrecio } from "@/lib/db";
import { cn } from "@/lib/cn";
import { ButtonGroup } from "@/components/ui/ButtonGroup";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";

const listaPrecioOptions = LISTAS_PRECIOS.map((n) => ({
  value: n,
  label: `Lista ${n}`,
  icon: "clipboardList" as const,
}));

export function ListaPreciosSelector({
  listaPrecios,
  listaDialogOpen,
  onListaChange,
  onDialogOpenChange,
}: {
  listaPrecios: ListaPrecio;
  listaDialogOpen: boolean;
  onListaChange: (lista: ListaPrecio) => void;
  onDialogOpenChange: (open: boolean) => void;
}) {
  return (
    <div className="ListaPreciosSelector rounded-2xl border border-[var(--apricot-light)]/60 bg-[linear-gradient(135deg,var(--cream-warm)/40,var(--peach-soft)/30)] p-3 flex flex-col gap-2.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--brown-burnt)]/70">Lista de precios</span>

      <div className="md:hidden inline-flex w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-1.5">
        <button
          type="button"
          onClick={() => onDialogOpenChange(true)}
          className="inline-flex flex-1 items-center justify-between gap-2 rounded-xl border border-[var(--color-accent)] bg-[var(--color-accent)] px-3 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(234,88,12,0.28)] transition focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-soft)]"
        >
          <span className="flex items-center gap-2 uppercase tracking-wider">
            <Icon name="clipboardList" className="h-4 w-4 shrink-0" />
            Lista {listaPrecios}
          </span>
          <Icon name="chevronDown" className="h-4 w-4 opacity-80" />
        </button>
      </div>

      <div className="hidden md:block w-full">
        <ButtonGroup
          options={listaPrecioOptions}
          value={listaPrecios}
          onChange={onListaChange}
          className="w-full"
        />
      </div>

      <input type="hidden" name="listaPrecios" value={listaPrecios} />

      <Dialog open={listaDialogOpen} onOpenChange={onDialogOpenChange}>
        <DialogContent variant="centered">
          <div className="rounded-t-[20px] bg-[linear-gradient(135deg,var(--cream-warm),rgba(255,255,255,0.95))] border-b border-[rgba(234,88,12,0.12)] pl-6 pr-14 pt-6 pb-4">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[var(--color-accent)]">
              Lista de precios
            </p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight text-[var(--text-color-defult)]">
              Lista {listaPrecios} activa
            </h3>
            <p className="mt-1 text-xs text-[var(--text-color-gray)]">
              Seleccioná la lista activa
            </p>
          </div>
          <div className="flex flex-col gap-2 overflow-y-auto p-4">
            {LISTAS_PRECIOS.map((n) => {
              const isActive = n === listaPrecios;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    onListaChange(n);
                    onDialogOpenChange(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 w-full rounded-xl px-4 py-4 text-left text-sm font-semibold transition-all",
                    isActive
                      ? "bg-[linear-gradient(135deg,var(--orange-vivid),var(--apricot-light))] text-white shadow-sm"
                      : "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--text-color-defult)] hover:bg-[var(--color-surface-alt)]"
                  )}
                >
                  <Icon name="clipboardList" className="h-5 w-5 shrink-0" />
                  <span className="flex-1">Lista {n}</span>
                  {isActive && <Icon name="check" className="h-4 w-4" />}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
