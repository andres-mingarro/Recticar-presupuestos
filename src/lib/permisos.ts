import { redirect } from "next/navigation";
import { getSession, requireSession } from "@/lib/auth";
import { getUsuarioPermisos } from "@/lib/queries/usuarios";
import type { AppPermiso } from "@/lib/queries/usuarios";
import type { SessionPayload } from "@/lib/auth";

export type { AppPermiso };

export async function getSessionPermisos(): Promise<AppPermiso[]> {
  const session = await getSession();
  if (!session) return [];
  if (session.role === "super_admin") return [];
  return getUsuarioPermisos(session.email);
}

export function hasPermission(
  session: SessionPayload,
  permisos: AppPermiso[],
  permiso: AppPermiso
): boolean {
  if (session.role === "super_admin") return true;
  return permisos.includes(permiso);
}

export async function requirePermission(
  permiso: AppPermiso,
  redirectTo = "/"
): Promise<{ session: SessionPayload; permisos: AppPermiso[] }> {
  const session = await requireSession();
  if (session.role === "super_admin") {
    return { session, permisos: [] };
  }
  const permisos = await getUsuarioPermisos(session.email);
  if (!permisos.includes(permiso)) {
    redirect(redirectTo);
  }
  return { session, permisos };
}

export async function getSessionWithPermisos(): Promise<{
  session: SessionPayload | null;
  permisos: AppPermiso[];
}> {
  const session = await getSession();
  if (!session) return { session: null, permisos: [] };
  if (session.role === "super_admin") return { session, permisos: [] };
  const permisos = await getUsuarioPermisos(session.email);
  return { session, permisos };
}

export function isSuperAdmin(session: SessionPayload | null): boolean {
  return session?.role === "super_admin";
}
