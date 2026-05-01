"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export type SearchableSelectOption = {
  value: string | number;
  label: string;
};

type SearchableSelectProps = {
  name: string;
  searchType: "marcas" | "modelos" | "motores";
  searchMode?: "default" | "nameOnly";
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
};

export function SearchableSelect({
  name,
  searchType,
  searchMode = "default",
  placeholder = "Buscar…",
  disabled = false,
  required = false,
  className,
}: SearchableSelectProps) {
  const [query, setQuery] = useState("");
  const [selectedValue, setSelectedValue] = useState<string>("");
  const [results, setResults] = useState<SearchableSelectOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listId = useId();

  // Cerrar al hacer click fuera
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  // Scroll al item activo
  useEffect(() => {
    if (!open || !listRef.current) return;
    const item = listRef.current.children[activeIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  function computeDirection() {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setOpenUpward(window.innerHeight - rect.bottom < 240);
  }

  function fetchResults(q: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!q.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/catalogo-tecnico/search?type=${searchType}&mode=${searchMode}&q=${encodeURIComponent(q)}`
        );
        const data = await res.json();
        setResults(data.results ?? []);
        setActiveIndex(0);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    setSelectedValue("");
    computeDirection();
    fetchResults(val);
  }

  function handleFocus() {
    computeDirection();
    if (results.length > 0 && query) setOpen(true);
  }

  function select(option: SearchableSelectOption) {
    setSelectedValue(String(option.value));
    setQuery(option.label);
    setResults([]);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && results[activeIndex]) select(results[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-[var(--color-info-border)] bg-white/80 px-3 py-1.5 text-sm placeholder:text-[var(--color-info-border-strong)] focus:border-[var(--color-info-border-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--color-info-border)]/40 disabled:opacity-60 disabled:cursor-not-allowed";

  const dropdownPos = openUpward ? "bottom-full mb-1" : "top-full mt-1";

  return (
    <div ref={containerRef} className={cn("SearchableSelect relative", className)}>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && results[activeIndex] ? `${listId}-${activeIndex}` : undefined}
        className={inputCls}
      />
      <input type="hidden" name={name} value={selectedValue} required={required} />

      {loading && (
        <div className={cn("absolute z-50 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--text-color-gray)] shadow-lg", dropdownPos)}>
          Buscando…
        </div>
      )}

      {!loading && open && results.length > 0 && (
        <ul id={listId} ref={listRef} role="listbox" className={cn("absolute z-50 max-h-56 w-full overflow-y-auto rounded-xl border border-[var(--color-border)] bg-white py-1 shadow-lg", dropdownPos)}>
          {results.map((option, i) => (
            <li
              key={option.value}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              onPointerDown={(e) => { e.preventDefault(); select(option); }}
              onPointerEnter={() => setActiveIndex(i)}
              className={cn(
                "cursor-pointer px-3 py-2 text-sm text-[var(--text-color-defult)] transition-colors",
                i === activeIndex
                  ? "bg-[var(--color-info-bg)] text-[var(--color-info-text-strong)]"
                  : "hover:bg-[var(--color-surface)]"
              )}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}

      {!loading && open && query.length > 0 && results.length === 0 && (
        <div className={cn("absolute z-50 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--text-color-gray)] shadow-lg", dropdownPos)}>
          Sin resultados para &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}
