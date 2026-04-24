import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  className?: string;
};

export function AppShellBody({ children, className }: Props) {
  return (
    <div className={cn("AppShellBody relative flex flex-1 overflow-hidden", className)}>
      {children}
    </div>
  );
}
