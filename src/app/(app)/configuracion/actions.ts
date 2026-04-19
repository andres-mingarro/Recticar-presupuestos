"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { upsertEmpresaConfig } from "@/lib/queries/empresa";

function normalize(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function updateEmpresaConfigAction(formData: FormData) {
  const session = await getSession();
  const role = session?.role;

  if (role !== "admin" && role !== "superuser") {
    redirect("/configuracion");
  }

  const nombre = normalize(formData, "nombre");

  if (!nombre) {
    redirect("/configuracion?error=nombre");
  }

  await upsertEmpresaConfig({
    nombre,
    tagline: normalize(formData, "tagline"),
    telefono: normalize(formData, "telefono"),
    email: normalize(formData, "email"),
    direccion: normalize(formData, "direccion"),
    ciudad: normalize(formData, "ciudad"),
    provincia: normalize(formData, "provincia"),
    cuit: normalize(formData, "cuit"),
  });

  revalidatePath("/configuracion");
  redirect("/configuracion?saved=1");
}
