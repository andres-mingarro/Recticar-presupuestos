import type { TechnicalSection } from "@/lib/queries/informacion-tecnica";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { Icon } from "@/components/ui/Icon";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { buildSectionHref } from "./buildSectionHref";

const SECTION_LABELS: Record<TechnicalSection, string> = {
  marcas: "Marcas",
  modelos: "Modelos",
  motores: "Motores",
  vehiculos: "Vehículos",
};

export function ContentCard({
  section,
  count,
  q,
  currentPage,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  pageStart,
  pageEnd,
  totalItems,
  columnHeaders,
  createForm,
  emptyLabel,
  children,
  tabsSlot,
}: {
  section: TechnicalSection;
  count: number;
  q: string;
  currentPage: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  pageStart: number;
  pageEnd: number;
  totalItems: number;
  columnHeaders?: React.ReactNode;
  createForm?: React.ReactNode;
  emptyLabel: string;
  children: React.ReactNode;
  tabsSlot?: React.ReactNode;
}) {
  return (
    <Card as="section" className="overflow-hidden p-0">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2">
        <Icon name="tag" className="h-4 w-4 shrink-0 text-[var(--color-accent)]" />
        <span className="text-sm font-semibold uppercase tracking-widest text-[var(--color-foreground)]">
          {SECTION_LABELS[section]}
        </span>
        <span className="shrink-0 rounded-full bg-[var(--color-border)] px-2 py-0.5 text-xs font-medium text-[var(--color-foreground-muted)]">
          {count}
        </span>

        {tabsSlot && (
          <>
            <Divider orientation="vertical" className="h-5" />
            {tabsSlot}
          </>
        )}

        <Divider orientation="vertical" className="h-5" />

        {/* Search */}
        <form className="flex min-w-0 flex-1 items-center gap-1.5">
          <input type="hidden" name="section" value={section} />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder={`Buscar en ${SECTION_LABELS[section].toLowerCase()}…`}
            className="min-w-0 flex-1 rounded-lg border border-[var(--color-border)] bg-white px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
          />
          <Button type="submit" className="shrink-0" icon={<Icon name="search" className="h-4 w-4" />}>
            Buscar
          </Button>
          {q && (
            <Button
              as="a"
              href={buildSectionHref(section, "")}
              variant="secondary"
              className="shrink-0"
              icon={<Icon name="x" className="h-4 w-4" />}
            >
              Limpiar
            </Button>
          )}
        </form>

        {(totalPages > 1 || currentPage > 1) && (
          <>
            <Divider orientation="vertical" className="h-5" />
            <div className="flex shrink-0 items-center gap-1.5">
              {hasPreviousPage ? (
                <Link
                  href={buildSectionHref(section, q, currentPage - 1)}
                  className="rounded-lg border border-[var(--color-border)] bg-white p-1.5 text-[var(--color-foreground-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  <Icon name="chevronLeft" className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <span className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-1.5 text-[var(--color-foreground-muted)] opacity-40">
                  <Icon name="chevronLeft" className="h-3.5 w-3.5" />
                </span>
              )}
              <span className="text-xs text-[var(--color-foreground-muted)]">
                {totalItems === 0 ? "0" : `${pageStart}–${pageEnd}`}
                <span className="mx-1 opacity-40">/</span>
                {totalItems}
              </span>
              {hasNextPage ? (
                <Link
                  href={buildSectionHref(section, q, currentPage + 1)}
                  className="rounded-lg border border-[var(--color-border)] bg-white p-1.5 text-[var(--color-foreground-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  <Icon name="chevronRight" className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <span className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-1.5 text-[var(--color-foreground-muted)] opacity-40">
                  <Icon name="chevronRight" className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Column headers ── */}
      {columnHeaders && (
        <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-1.5">
          {columnHeaders}
        </div>
      )}

      {/* ── Rows ── */}
      {totalItems === 0 ? (
        <p className="px-4 py-4 text-sm text-[var(--color-foreground-muted)]">{emptyLabel}</p>
      ) : (
        <div>{children}</div>
      )}

      {/* ── Add form footer ── */}
      {createForm}
    </Card>
  );
}
