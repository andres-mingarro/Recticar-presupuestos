import { cn } from "@/lib/cn";

type DividerProps = {
  orientation?: "horizontal" | "vertical";
  className?: string;
};

export function Divider({
  orientation = "horizontal",
  className,
}: DividerProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        orientation === "horizontal"
          ? "h-px w-full bg-[var(--color-border)]"
          : "h-full w-px self-stretch bg-[var(--color-border)]",
        className
      )}
    />
  );
}
