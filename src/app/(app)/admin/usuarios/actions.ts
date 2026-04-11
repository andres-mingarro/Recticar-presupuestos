"use server";

import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";
import {
  createUsuario,
  deleteUsuario,
  toggleUsuarioActivo,
  updateUsuarioPassword,
  updateUsuarioRole,
} from "@/lib/queries/usuarios";
import { revalidatePath } from "next/cache";

async function getSessionRole() {
  const session = await getSession();
  return session?.role ?? null;
}

function canManage(
  actorRole: string | null,
  targetRole: string
): boolean {
  if (!actorRole) return false;
  if (actorRole === "admin") return true;
  // superuser puede manejar solo a operadores
  if (actorRole === "superuser" && targetRole === "operador") return true;
  return false;
}

export async function crearUsuarioAction(formData: FormData) {
  const role = await getSessionRole();
  if (role !== "admin" && role !== "superuser") throw new Error("Sin permiso");

  const nombre = formData.get("nombre") as string;
  const password = formData.get("password") as string;
  const nuevoRol = formData.get("role") as "superuser" | "operador";

  if (role === "superuser" && nuevoRol === "superuser")
    throw new Error("Sin permiso para crear superusers");

  const hash = await bcrypt.hash(password, 12);
  // el nombre es también el identificador de login (columna email en DB)
  await createUsuario(nombre, nombre, hash, nuevoRol);
  revalidatePath("/admin/usuarios");
}

export async function cambiarRolAction(
  email: string,
  nuevoRol: "superuser" | "operador",
  targetRole: string
) {
  const role = await getSessionRole();
  if (!canManage(role, targetRole)) throw new Error("Sin permiso");
  if (role === "superuser" && nuevoRol === "superuser")
    throw new Error("Sin permiso para asignar superuser");
  await updateUsuarioRole(email, nuevoRol);
  revalidatePath("/admin/usuarios");
}

export async function cambiarPasswordAction(
  email: string,
  password: string,
  targetRole: string
) {
  const role = await getSessionRole();
  if (!canManage(role, targetRole)) throw new Error("Sin permiso");
  const hash = await bcrypt.hash(password, 12);
  await updateUsuarioPassword(email, hash);
  revalidatePath("/admin/usuarios");
}

export async function toggleActivoAction(
  email: string,
  activo: boolean,
  targetRole: string
) {
  const role = await getSessionRole();
  if (!canManage(role, targetRole)) throw new Error("Sin permiso");
  await toggleUsuarioActivo(email, activo);
  revalidatePath("/admin/usuarios");
}

export async function eliminarUsuarioAction(
  email: string,
  targetRole: string
) {
  const role = await getSessionRole();
  if (!canManage(role, targetRole)) throw new Error("Sin permiso");
  await deleteUsuario(email);
  revalidatePath("/admin/usuarios");
}
