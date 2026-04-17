import Link from "next/link";
import { cn } from "@/lib/cn";
import { buttonStyles } from "@/components/ui/Button";
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
        <Link
          href={previousHref}
          aria-disabled={!hasPreviousPage}
          className={buttonStyles({
            variant: "secondary",
            size: "sm",
            className: cn(
              "sm:w-auto",
              !hasPreviousPage ? "pointer-events-none opacity-50" : undefined
            ),
          })}
        >
          <Icon name="chevronLeft" className="h-4 w-4" />
          Anterior
        </Link>
        <span className="flex px-2 text-sm text-[var(--color-foreground-muted)]">
          <span className="hidden lg:block">Página</span> {currentPage} de {totalPages}
        </span>
        <Link
          href={nextHref}
          aria-disabled={!hasNextPage}
          className={buttonStyles({
            variant: "secondary",
            size: "sm",
            className: cn(
              "sm:w-auto",
              !hasNextPage ? "pointer-events-none opacity-50" : undefined
            ),
          })}
        >
          Siguiente
          <Icon name="chevronRight" className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
