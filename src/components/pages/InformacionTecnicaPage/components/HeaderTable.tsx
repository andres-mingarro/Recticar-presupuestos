import type { TechnicalSection } from "@/lib/queries/informacion-tecnica";
import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { Icon } from "@/components/ui/Icon";
import Link from "next/link";
import { SearchBar } from "./SearchBar";
import { buildSectionHref } from "./buildSectionHref";

const SECTION_LABELS: Record<TechnicalSection, string> = {
  marcas: "Marcas",
  modelos: "Modelos",
  motores: "Motores",
  vehiculos: "Vehículos",
};

export function HeaderTable({
  section,
  count,
  q,
  tab,
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
  toolbarSlot,
  marcaId,
}: {
  section: TechnicalSection;
  count: number;
  q: string;
  tab?: string;
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
  toolbarSlot?: React.ReactNode;
  marcaId?: string;
}) {
  return (
    <Card noPadding as="section" className="HeaderTable overflow-hidden">
      {/* ── Toolbar ── */}
      <div className="toolbar flex flex-col gap-0 border-b border-[var(--color-border)] bg-[var(--gray-40)]">
        {/* Row 1: título + tabs */}
        <div className="toolbar-inner flex justify-between lg:flex-row flex-col items-center gap-2 px-4 py-2">
          <div className="toolbar-header">
            <Icon name="tag" className="h-4 w-4 shrink-0 text-[var(--color-accent)]" />
            <span className="text-lg lg:text-sm font-semibold uppercase tracking-widest text-[var(--text-color-defult)]">
              {SECTION_LABELS[section]}
            </span>
            <span className="shrink-0 rounded-full bg-[var(--color-border)] px-2 py-0.5 text-xs font-medium text-[var(--text-color-gray)]">
              {count}
            </span>
          </div>
          <div className="toolbar-footer">
            {tabsSlot && (
              <>
                <Divider orientation="vertical" className="h-5" />
                {tabsSlot}
              </>
            )}
          </div>


        </div>

        {/* Row 2: búsqueda + paginación */}
        <div className="relative flex items-center gap-2 border-t border-[var(--color-border)] px-3 py-2">
          <SearchBar section={section} q={q} tab={tab} marcaId={marcaId} />
          {toolbarSlot}

          {(totalPages > 1 || currentPage > 1) && (
            <>
              <Divider orientation="vertical" className="h-5" />
              <div className="flex shrink-0 items-center gap-1.5">
                {hasPreviousPage ? (
                  <Link
                    href={buildSectionHref(section, q, currentPage - 1, tab, marcaId)}
                    className="rounded-lg border border-[var(--color-border)] bg-white p-1.5 text-[var(--text-color-gray)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                  >
                    <Icon name="chevronLeft" className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <span className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-1.5 text-[var(--text-color-gray)] opacity-40">
                    <Icon name="chevronLeft" className="h-3.5 w-3.5" />
                  </span>
                )}
                <span className="text-xs text-[var(--text-color-gray)]">
                  {totalItems === 0 ? "0" : `${pageStart}–${pageEnd}`}
                  <span className="mx-1 opacity-40">/</span>
                  {totalItems}
                </span>
                {hasNextPage ? (
                  <Link
                    href={buildSectionHref(section, q, currentPage + 1, tab, marcaId)}
                    className="rounded-lg border border-[var(--color-border)] bg-white p-1.5 text-[var(--text-color-gray)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                  >
                    <Icon name="chevronRight" className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <span className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-1.5 text-[var(--text-color-gray)] opacity-40">
                    <Icon name="chevronRight" className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Column headers ── */}
      {columnHeaders && (
        <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-1.5">
          {columnHeaders}
        </div>
      )}

      {/* ── Rows ── */}
      {totalItems === 0 ? (
        <p className="px-4 py-4 text-sm text-[var(--text-color-gray)]">{emptyLabel}</p>
      ) : (
        <div>{children}</div>
      )}

      {/* ── Add form footer ── */}
      {createForm}
    </Card>
  );
}
