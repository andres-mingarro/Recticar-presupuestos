"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import styles from "./MainMenu.module.scss";

const baseItems = [
  { href: "/", label: "Dashboard", exact: true },
  { href: "/clientes", label: "Clientes", exact: false },
  { href: "/pedidos", label: "Pedidos", exact: false },
  { href: "/precios", label: "Precios", exact: false },
];

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

type Props = {
  role?: string;
};

export function MainMenu({ role }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const items = [
    ...baseItems,
    ...(role === "admin" || role === "superuser"
      ? [{ href: "/admin/usuarios", label: "Usuarios", exact: false }]
      : []),
  ];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <nav className={cn("MainMenu", styles.MainMenu, "text-sm")} aria-label="Principal">
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
                  ? "bg-[var(--color-accent)] !text-white shadow-[0_10px_30px_rgba(234,88,12,0.18)]"
                  : "text-[var(--color-foreground-muted)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-foreground)]"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={handleLogout}
        className="rounded-lg px-3 py-2 text-sm text-[var(--color-foreground-muted)] transition hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-foreground)]"
      >
        Salir
      </button>
    </div>
  );
}
