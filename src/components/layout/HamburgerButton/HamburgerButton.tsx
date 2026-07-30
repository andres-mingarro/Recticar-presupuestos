import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

type Props = {
  type?: "header" | "mobileActions";
  className?: string;
  "aria-label"?: string;
  onClick?: () => void;
};

export function HamburgerButton({
  type = "header",
  className,
  onClick,
  "aria-label": ariaLabel = "Abrir menú",
}: Props) {
  return (
    <button
      type="button"
      className={cn(
        "HamburgerButton flex shrink-0 items-center justify-center transition-[background,color,border-color] duration-150 ease-in-out",
        type === "header" &&
          "size-10 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--text-color-defult)] shadow-[0_2px_8px_var(--color-shadow-sm)] hover:border-[var(--color-accent)]",
        type === "mobileActions" &&
          "h-full w-[3.2rem] border-l border-[var(--color-sidebar-border)] bg-[var(--color-sidebar-surface)] text-[20px] text-[var(--color-sidebar-text-strong)] active:bg-[var(--color-surface-raised)]/20 active:text-white",
        className
      )}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <Icon name="menu" className="size-5" />
    </button>
  );
}
