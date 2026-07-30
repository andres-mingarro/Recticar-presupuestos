"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import type { TechnicalSection } from "@/lib/queries/informacion-tecnica";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { buildSectionHref } from "./buildSectionHref";

type Suggestion = { label: string; searchValue: string };

type SearchBarProps = {
  section: TechnicalSection;
  q: string;
  tab?: string;
  marcaId?: string;
};

export function SearchBar({ section, q, tab, marcaId }: SearchBarProps) {
  const { push } = useRouter();
  const [value, setValue] = useState(q);
  const [results, setResults] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listId = useId();

  useEffect(() => {
    setValue(q);
  }, [q]);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const item = listRef.current.children[activeIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  function navigate(searchValue: string) {
    setOpen(false);
    push(buildSectionHref(section, searchValue, 1, tab, marcaId));
  }

  function fetchSuggestions(q: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) { setResults([]); setOpen(false); return; }

    debounceRef.current = setTimeout(async () => {
      try {
        const isHiddenTab = tab === "ocultas" || tab === "ocultos";
        const mode = section === "modelos" ? "&mode=nameOnly" : "";
        const marcaParam = section === "modelos" && marcaId ? `&marcaId=${encodeURIComponent(marcaId)}` : "";
        const res = await fetch(
          `/api/catalogo-tecnico/search?type=${section}&q=${encodeURIComponent(q)}&hidden=${isHiddenTab}${mode}${marcaParam}`
        );
        const data = await res.json();
        const suggestions: Suggestion[] = (data.results ?? []).map((r: { label: string; searchValue?: string }) => ({
          label: r.label,
          searchValue: r.searchValue ?? r.label,
        }));
        setResults(suggestions);
        setActiveIndex(0);
        setOpen(suggestions.length > 0);
      } catch {
        setResults([]);
      }
    }, 200);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setValue(val);
    fetchSuggestions(val);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && results[activeIndex]) {
        setValue(results[activeIndex].label);
        navigate(results[activeIndex].searchValue);
      } else {
        navigate(value);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const inputCls =
    "min-w-0 flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20";

  return (
    <div
      ref={containerRef}
      className={cn("flex min-w-0 items-center gap-1.5 transition-[width,opacity] duration-200", focused ? "absolute inset-x-3 z-20 sm:relative sm:inset-auto sm:flex-1" : "flex-1")}
      onFocus={() => setFocused(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false); }}
    >
      <div className="relative w-full min-w-0 flex">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          placeholder="Buscar…"
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open && results[activeIndex] ? `${listId}-${activeIndex}` : undefined}
          className={inputCls}
        />
        {open && results.length > 0 && (
          <ul
            id={listId}
            ref={listRef}
            role="listbox"
            className="absolute left-0 top-full z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] py-1 shadow-lg"
          >
            {results.map((suggestion, i) => (
              <li
                key={i}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === activeIndex}
                onPointerDown={(e) => { e.preventDefault(); setValue(suggestion.label); navigate(suggestion.searchValue); }}
                onPointerEnter={() => setActiveIndex(i)}
                className={
                  i === activeIndex
                    ? "cursor-pointer bg-[var(--color-accent-soft)] px-3 py-2 text-sm text-[var(--color-accent)]"
                    : "cursor-pointer px-3 py-2 text-sm text-[var(--text-color-defult)] hover:bg-[var(--color-surface)]"
                }
              >
                {suggestion.label}
              </li>
            ))}
          </ul>
        )}
      </div>
      <Button
        type="button"
        size="md"
        className="shrink-0"
        icon={<Icon name="search" className="size-4" />}
        onClick={() => navigate(value)}
      >
        <span className="hidden sm:inline">Buscar</span>
      </Button>
      {q && (
        <Button
          as="a"
          href={buildSectionHref(section, "", 1, tab, marcaId)}
          variant="secondary"
          size="sm"
          className="shrink-0"
          icon={<Icon name="x" className="size-4" />}
        >
          <span className="hidden sm:inline">Limpiar</span>
        </Button>
      )}
    </div>
  );
}
