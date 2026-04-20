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

  const hash = await bcrypt.hash(password, 12);
  await createUsuario(nombre, nombre, hash, password, "operario");
  revalidatePath("/admin/usuarios");
}

export async function actualizarPermisosAction(
  email: string,
  permisos: AppPermiso[]
) {
  await requireSuperAdmin();
  await setUsuarioPermisos(email, permisos);
  revalidatePath("/admin/usuarios");
}

export async function cambiarPasswordAction(email: string, password: string) {
  await requireSuperAdmin();
  const hash = await bcrypt.hash(password, 12);
  await updateUsuarioPassword(email, hash, password);
  revalidatePath("/admin/usuarios");
}

export async function toggleActivoAction(email: string, activo: boolean) {
  await requireSuperAdmin();
  await toggleUsuarioActivo(email, activo);
  revalidatePath("/admin/usuarios");
}

export async function actualizarPantallaInicioAction(
  email: string,
  pantalla: PantallaInicio
) {
  await requireSuperAdmin();
  await updatePantallaInicio(email, pantalla);
  revalidatePath("/admin/usuarios");
}

export async function eliminarUsuarioAction(email: string) {
  await requireSuperAdmin();
  await deleteUsuario(email);
  revalidatePath("/admin/usuarios");
}
