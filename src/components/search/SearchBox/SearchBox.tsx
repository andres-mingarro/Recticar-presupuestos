"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { ClienteListItem, TrabajoListItem } from "@/lib/types";
import { Input } from "@/components/ui/Input";
import styles from "./SearchBox.module.scss";

export type SearchEntity = "clientes" | "trabajos";

type SearchItem = ClienteListItem | TrabajoListItem;

type SearchConfig<TItem extends SearchItem> = {
  emptyMessage: string;
  endpoint: string;
  label: string;
  placeholder: string;
  responseKey: string;
  clearHref: string;
  getHref: (item: TItem) => string;
  getTitle: (item: TItem) => string;
  getSubtitle: (item: TItem) => string;
};

const searchConfigs: {
  clientes: SearchConfig<ClienteListItem>;
  trabajos: SearchConfig<TrabajoListItem>;
} = {
  clientes: {
    emptyMessage: "No se encontraron coincidencias.",
    endpoint: "/api/clientes/search",
    label: "Busqueda de clientes",
    placeholder: "Buscar por nombre o apellido",
    responseKey: "clientes",
    clearHref: "/clientes",
    getHref: (item) => `/clientes/${item.id}`,
    getTitle: (item) => `#${item.numero_cliente} · ${item.apellido}, ${item.nombre}`,
    getSubtitle: (item) => item.telefono || "Sin teléfono",
  },
  trabajos: {
    emptyMessage: "No se encontraron trabajos.",
    endpoint: "/api/trabajos/search",
    label: "Busqueda de trabajos",
    placeholder: "Buscar por numero o ID de trabajo",
    responseKey: "trabajos",
    clearHref: "/trabajos",
    getHref: (item) => `/trabajos/${item.id}`,
    getTitle: (item) => `Trabajo #${item.numero_trabajo}`,
    getSubtitle: (item) => item.cliente_nombre || "Sin cliente asignado",
  },
};

type SearchBoxProps = {
  entity: SearchEntity;
  initialValue: string;
};

export function SearchBox({ entity, initialValue }: SearchBoxProps) {
  const config = searchConfigs[entity];
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<SearchItem[]>([]);
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
          `${config.endpoint}?q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );
        const data = (await response.json()) as Record<string, SearchItem[]>;
        setResults(data[config.responseKey] ?? []);
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
  }, [config.endpoint, config.responseKey, query]);

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
    <div ref={containerRef} className={cn("SearchBox", styles.SearchBox)}>
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
        placeholder={config.placeholder}
        autoComplete="off"
      />

      {isLoading ? (
        <p className="mt-2 text-xs text-[var(--color-foreground-muted)]">
          Buscando coincidencias...
        </p>
      ) : null}

      {isOpen ? (
        <div className={cn("SearchBoxDropdown", styles.SearchBoxDropdown)}>
          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-3 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
            {results.length === 0 ? (
              <p className="px-2 py-3 text-sm text-[var(--color-foreground-muted)]">
                {config.emptyMessage}
              </p>
            ) : (
              <div className={cn("SearchBoxList", styles.SearchBoxList)}>
                {results.map((item) => (
                  <Link
                    key={item.id}
                    href={config.getHref(item as never)}
                    className="flex items-center justify-between gap-3 rounded-xl bg-[var(--color-surface)] px-3 py-3 transition hover:bg-[var(--color-surface-alt)]"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--color-foreground)]">
                        {config.getTitle(item as never)}
                      </p>
                      <p className="truncate text-xs text-[var(--color-foreground-muted)]">
                        {config.getSubtitle(item as never)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className="inline-flex items-center justify-center gap-2 rounded-xl px-3 h-8 text-xs font-medium text-[var(--color-foreground-muted)] bg-transparent pointer-events-none"
                        aria-hidden="true"
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

export { searchConfigs };
