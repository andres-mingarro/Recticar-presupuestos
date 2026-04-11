"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { ClienteListItem } from "@/lib/types";
import { Input } from "@/components/ui/Input";
import { buttonStyles } from "@/components/ui/Button";
import styles from "./ClienteSearchBox.module.scss";

type ClienteSearchBoxProps = {
  initialValue: string;
};

export function ClienteSearchBox({ initialValue }: ClienteSearchBoxProps) {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<ClienteListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    if (query.trim().length < 1) {
      setResults([]);
      setIsOpen(false);
      setIsLoading(false);
      return () => controller.abort();
    }

    setIsLoading(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/clientes/search?q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );
        const data = (await response.json()) as { clientes: ClienteListItem[] };
        setResults(data.clientes);
        setIsOpen(true);
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("ClienteSearchBox", styles.ClienteSearchBox)}
    >
      <Input
        type="search"
        name="q"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => {
          if (results.length > 0) {
            setIsOpen(true);
          }
        }}
        placeholder="Buscar por nombre o apellido"
        autoComplete="off"
      />

      {isLoading ? (
        <p className="mt-2 text-xs text-[var(--color-foreground-muted)]">
          Buscando coincidencias...
        </p>
      ) : null}

      {isOpen ? (
        <div
          className={cn(
            "ClienteSearchBoxDropdown",
            styles.ClienteSearchBoxDropdown
          )}
        >
          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-3 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
            {results.length === 0 ? (
              <p className="px-2 py-3 text-sm text-[var(--color-foreground-muted)]">
                No se encontraron coincidencias.
              </p>
            ) : (
              <div
                className={cn(
                  "ClienteSearchBoxList",
                  styles.ClienteSearchBoxList
                )}
              >
                {results.map((cliente) => (
                  <Link
                    key={cliente.id}
                    href={`/clientes/${cliente.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl bg-[var(--color-surface)] px-3 py-3 transition hover:bg-[var(--color-surface-alt)]"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--color-foreground)]">
                        #{cliente.numero_cliente} · {cliente.apellido}, {cliente.nombre}
                      </p>
                      <p className="truncate text-xs text-[var(--color-foreground-muted)]">
                        {cliente.telefono || "Sin teléfono"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={buttonStyles({
                          variant: "ghost",
                          size: "sm",
                          className: "pointer-events-none",
                        })}
                      >
                        Abrir
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
