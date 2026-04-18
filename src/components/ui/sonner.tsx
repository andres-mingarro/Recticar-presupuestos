"use client";

import { Toaster as Sonner } from "sonner";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      richColors
      expand
      closeButton
      gap={14}
      visibleToasts={4}
      offset={{ top: 24, right: 24 }}
      mobileOffset={{ top: 16, right: 12, left: 12 }}
      style={{
        ["--toast-close-button-start" as string]: "unset",
        ["--toast-close-button-end" as string]: "0px",
        ["--toast-close-button-transform" as string]: "translate(0, 0)",
      }}
      icons={{
        success: (
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--orange-vivid),var(--color-accent))] text-white shadow-[0_10px_24px_rgba(234,88,12,0.32)]">
            <Icon name="check" className="h-4 w-4" />
          </span>
        ),
        error: (
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#ef4444,#be123c)] text-white shadow-[0_10px_24px_rgba(190,24,93,0.22)]">
            <Icon name="x" className="h-4 w-4" />
          </span>
        ),
        close: <Icon name="x" className="h-4 w-4" />,
      }}
      toastOptions={{
        classNames: {
          toast: cn(
            "group border-none rounded-[24px] p-0 overflow-hidden",
            "shadow-[0_22px_70px_rgba(15,23,42,0.14)] ring-1 ring-[rgba(128,54,0,0.08)]"
          ),
          content: "gap-3 px-4 py-4 sm:px-5 sm:py-4",
          title: "text-[15px] font-semibold tracking-[-0.01em] text-[var(--brown-burnt)]",
          description: "text-[13px] leading-5 text-[var(--text-color-gray)]",
          icon: "mt-0.5 shrink-0",
          closeButton: cn(
            "!left-auto !right-0 !top-[6px] !mt-0 !translate-x-0 !translate-y-0",
            "!h-8 !w-8 !rounded-full !border !border-[rgba(128,54,0,0.12)]",
            "!bg-white/80 !text-[var(--brown-burnt)] !shadow-none",
            "backdrop-blur transition hover:!bg-[var(--cream-warm)] hover:!border-[rgba(234,88,12,0.2)]"
          ),
          success: "before:absolute before:inset-y-0 before:left-0 before:w-1.5 before:bg-[linear-gradient(180deg,var(--orange-vivid),var(--color-accent))]",
          error: "before:absolute before:inset-y-0 before:left-0 before:w-1.5 before:bg-[linear-gradient(180deg,#ef4444,#be123c)]",
          loading: "before:absolute before:inset-y-0 before:left-0 before:w-1.5 before:bg-[linear-gradient(180deg,#0ea5e9,#0284c7)]",
          info: "before:absolute before:inset-y-0 before:left-0 before:w-1.5 before:bg-[linear-gradient(180deg,#38bdf8,#0284c7)]",
          warning: "before:absolute before:inset-y-0 before:left-0 before:w-1.5 before:bg-[linear-gradient(180deg,#fb923c,#ea580c)]",
          default: "before:absolute before:inset-y-0 before:left-0 before:w-1.5 before:bg-[linear-gradient(180deg,var(--apricot-light),var(--orange-vivid))]",
        },
        style: {
          background:
            "linear-gradient(135deg, rgba(255, 247, 237, 0.98), rgba(255, 255, 255, 0.96))",
          border: "1px solid rgba(128, 54, 0, 0.08)",
          borderRadius: "24px",
          color: "var(--text-color-defult)",
          boxShadow: "0 22px 70px rgba(15, 23, 42, 0.14)",
        },
      }}
    />
  );
}
