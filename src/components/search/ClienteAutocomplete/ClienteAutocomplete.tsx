"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { ClienteListItem } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";

type ClienteAutocompleteProps = {
  name: string;
  initialId?: string;
  initialLabel?: string;
  placeholder?: string;
};

export function ClienteAutocomplete({
  name,
  initialId = "",
  initialLabel = "",
  placeholder = "Buscar por nombre o apellido...",
}: ClienteAutocompleteProps) {
  const [selectedId, setSelectedId] = useState(initialId);
  const [selectedLabel, setSelectedLabel] = useState(initialLabel);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ClienteListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    const controller = new AbortController();

    if (query.trim().length < 1) {
      setResults([]);
      setIsOpen(false);
      setIsLoading(false);
      return () => controller.abort();
    }

    setIsLoading(true);
    setFocusedIndex(-1);

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/clientes/search?q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );
        const data = (await response.json()) as { clientes: ClienteListItem[] };
        setResults(data.clientes);
        setIsOpen(data.clientes.length > 0);
      } catch {
        setResults([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectCliente(cliente: ClienteListItem) {
    setSelectedId(String(cliente.id));
    setSelectedLabel(`#${cliente.numero_cliente} · ${cliente.apellido}, ${cliente.nombre}`);
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setFocusedIndex(-1);
  }

  function clearSelection() {
    setSelectedId("");
    setSelectedLabel("");
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (!isOpen || results.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setFocusedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setFocusedIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter" && focusedIndex >= 0) {
      event.preventDefault();
      selectCliente(results[focusedIndex]);
    } else if (event.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={selectedId} />

      {selectedId ? (
        /* Selected state: show label + clear button */
        <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm">
          <Icon name="user" className="h-4 w-4 shrink-0 text-[var(--color-accent)]" />
          <span className="flex-1 font-medium text-[var(--color-foreground)]">
            {selectedLabel}
          </span>
          <button
            type="button"
            onClick={clearSelection}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[var(--color-foreground-muted)] transition hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-foreground)]"
            aria-label="Quitar cliente"
          >
            <Icon name="x" className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        /* Search state */
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            {isLoading ? (
              <svg
                aria-hidden="true"
                className="h-4 w-4 animate-spin text-[var(--color-foreground-muted)]"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <Icon name="search" className="h-4 w-4 text-[var(--color-foreground-muted)]" />
            )}
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => { if (results.length > 0) setIsOpen(true); }}
            placeholder={placeholder}
            autoComplete="off"
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pl-9 pr-3 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-foreground-muted)] transition focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
          />
        </div>
      )}

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1">
          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
            {results.map((cliente, index) => (
              <button
                key={cliente.id}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); selectCliente(cliente); }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
                  focusedIndex === index
                    ? "bg-[var(--color-surface-alt)]"
                    : "hover:bg-[var(--color-surface-alt)]"
                )}
              >
                <Icon name="user" className="h-4 w-4 shrink-0 text-[var(--color-foreground-muted)]" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--color-foreground)]">
                    #{cliente.numero_cliente} · {cliente.apellido}, {cliente.nombre}
                  </p>
                  <p className="text-xs text-[var(--color-foreground-muted)]">
                    {cliente.telefono ?? "Sin teléfono"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {!selectedId && query.trim().length >= 1 && !isLoading && !isOpen && (
        <p className="mt-1.5 text-xs text-[var(--color-foreground-muted)]">
          No se encontraron coincidencias para &quot;{query}&quot;.
        </p>
      )}
    </div>
  );
}
