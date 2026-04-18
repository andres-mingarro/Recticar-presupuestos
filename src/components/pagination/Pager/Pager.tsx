import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

type PagerProps = {
  currentPage: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  previousHref: string;
  nextHref: string;
  summary: string;
  className?: string;
};

export function Pager({
  currentPage,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  previousHref,
  nextHref,
  summary,
  className,
}: PagerProps) {
  return (
    <div className={cn("Pager", className)}>
      <p className="text-sm text-[var(--color-foreground-muted)]">{summary}</p>

      <div className="flex w-full flex-wrap justify-between items-center gap-2 sm:w-auto sm:justify-end">
        <Button
          as="a"
          href={previousHref}
          aria-disabled={!hasPreviousPage}
          variant="secondary"
          size="sm"
          className={cn("sm:w-auto", !hasPreviousPage ? "pointer-events-none opacity-50" : undefined)}
          icon={<Icon name="chevronLeft" className="h-4 w-4" />}
        >
          Anterior
        </Button>
        <span className="flex px-2 text-sm text-[var(--color-foreground-muted)]">
          <span className="hidden lg:block">Página</span> {currentPage} de {totalPages}
        </span>
        <Button
          as="a"
          href={nextHref}
          aria-disabled={!hasNextPage}
          variant="secondary"
          size="sm"
          className={cn("sm:w-auto", !hasNextPage ? "pointer-events-none opacity-50" : undefined)}
          iconRight={<Icon name="chevronRight" className="h-4 w-4" />}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
