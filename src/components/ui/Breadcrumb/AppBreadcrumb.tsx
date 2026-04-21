"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./Breadcrumb";

const SEGMENT_LABELS: Record<string, string> = {
  clientes: "Clientes",
  trabajos: "Trabajos",
  nuevo: "Nuevo",
  precios: "Precios",
  repuestos: "Repuestos",
  "informacion-tecnica": "Información técnica",
  configuracion: "Configuración",
  admin: "Admin",
  usuarios: "Usuarios",
  etiqueta: "Etiqueta",
};

// Rutas que lógicamente pertenecen a un padre aunque la URL no lo refleje
const VIRTUAL_PARENTS: Record<string, { label: string; href: string }> = {
  "/informacion-tecnica": { label: "Configuración", href: "/configuracion" },
  "/admin/usuarios": { label: "Configuración", href: "/configuracion" },
};

function labelForSegment(segment: string): string {
  return SEGMENT_LABELS[segment] ?? `#${segment}`;
}

export function AppBreadcrumb() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);
  const virtualParent = VIRTUAL_PARENTS[pathname] ?? null;

  const crumbs = segments.map((seg, i) => ({
    label: labelForSegment(seg),
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));

  // Para rutas con padre virtual, el último segmento pasa a ser la página actual
  // y se antepone el padre virtual como enlace intermedio
  const finalCrumbs = virtualParent
    ? [{ label: virtualParent.label, href: virtualParent.href, isLast: false }, ...crumbs.map((c) => ({ ...c, isLast: true }))]
    : crumbs;

  return (
    <Breadcrumb className="AppBreadcrumb px-1 mt-2 mb-5">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {finalCrumbs.map((crumb) => (
          <span key={crumb.href} className="contents">
            <BreadcrumbItem>
              {crumb.isLast ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!crumb.isLast && <BreadcrumbSeparator />}
          </span>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
