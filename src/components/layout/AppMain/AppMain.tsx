import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { AppBreadcrumb } from "@/components/ui/Breadcrumb";

type Props = {
  children: ReactNode;
  className?: string;
};

export function AppMain({ children, className }: Props) {
  return (
    <main className={cn("AppMain min-w-0 flex-1 overflow-y-auto p-4", className)}>
      <AppBreadcrumb />
      {children}
      <div className="h-[calc(70px+env(safe-area-inset-bottom))] md:hidden" />
    </main>
  );
}
