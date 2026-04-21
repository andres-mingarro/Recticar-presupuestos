"use server";

import bcrypt from "bcryptjs";
import { getSessionWithPermisos, isSuperAdmin } from "@/lib/permisos";
import {
  createUsuario,
  deleteUsuario,
  toggleUsuarioActivo,
  updateUsuarioPassword,
  setUsuarioPermisos,
  updatePantallaInicio,
} from "@/lib/queries/usuarios";
import type { AppPermiso, PantallaInicio } from "@/lib/queries/usuarios";
import { revalidatePath } from "next/cache";

async function requireSuperAdmin() {
  const { session } = await getSessionWithPermisos();
  if (!isSuperAdmin(session)) throw new Error("Sin permiso");
}

export async function crearUsuarioAction(formData: FormData) {
  await requireSuperAdmin();

  const nombre = formData.get("nombre") as string;
  const password = formData.get("password") as string;
  const role = (formData.get("role") as string) === "super_admin" ? "super_admin" : "operario";

  const hash = await bcrypt.hash(password, 12);
  await createUsuario(nombre, hash, password, role);
  revalidatePath("/admin/usuarios");
}

export async function actualizarPermisosAction(
  nombre: string,
  permisos: AppPermiso[]
) {
  await requireSuperAdmin();
  await setUsuarioPermisos(nombre, permisos);
  revalidatePath("/admin/usuarios");
}

export async function cambiarPasswordAction(nombre: string, password: string) {
  await requireSuperAdmin();
  const hash = await bcrypt.hash(password, 12);
  await updateUsuarioPassword(nombre, hash, password);
  revalidatePath("/admin/usuarios");
}

export async function toggleActivoAction(nombre: string, activo: boolean) {
  await requireSuperAdmin();
  await toggleUsuarioActivo(nombre, activo);
  revalidatePath("/admin/usuarios");
}

export async function actualizarPantallaInicioAction(
  nombre: string,
  pantalla: PantallaInicio
) {
  await requireSuperAdmin();
  await updatePantallaInicio(nombre, pantalla);
  revalidatePath("/admin/usuarios");
}

export async function eliminarUsuarioAction(nombre: string) {
  await requireSuperAdmin();
  if (nombre === process.env.ADMIN_USER) throw new Error("El usuario admin no se puede eliminar");
  await deleteUsuario(nombre);
  revalidatePath("/admin/usuarios");
}
