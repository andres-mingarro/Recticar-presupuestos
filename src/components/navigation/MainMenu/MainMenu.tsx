"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import styles from "./MainMenu.module.scss";

const items = [
  { href: "/", label: "Dashboard", exact: true },
  { href: "/clientes", label: "Clientes", exact: false },
  { href: "/pedidos", label: "Pedidos", exact: false },
];

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MainMenu() {
  const pathname = usePathname();

  return (
    <nav
      className={cn("MainMenu", styles.MainMenu, "text-sm")}
      aria-label="Principal"
    >
      {items.map((item) => {
        const active = isActive(pathname, item.href, item.exact);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-lg px-3 py-2 transition",
              active
                ? "bg-[var(--color-accent)] text-white shadow-[0_10px_30px_rgba(234,88,12,0.18)]"
                : "text-[var(--color-foreground-muted)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-foreground)]"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
