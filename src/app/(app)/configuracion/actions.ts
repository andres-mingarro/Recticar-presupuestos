"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getEmpresaConfig, upsertEmpresaConfig } from "@/lib/queries/empresa";
import { cleanupExpiredPresupuestosEntregados } from "@/lib/maintenance/trabajos-cleanup";

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
    autoEliminarPresupuestosEntregados:
      formData.get("autoEliminarPresupuestosEntregados") === "true",
    mesesRetencionPresupuestoEntregado: Math.max(
      1,
      Number(normalize(formData, "mesesRetencionPresupuestoEntregado")) || 3
    ),
  });

  revalidatePath("/configuracion");
  redirect("/configuracion?saved=1");
}

export async function updateEmpresaCleanupConfigAction(formData: FormData) {
  const session = await getSession();
  const role = session?.role;

  if (role !== "admin" && role !== "superuser") {
    redirect("/configuracion");
  }

  const empresaActual = await getEmpresaConfig();

  await upsertEmpresaConfig({
    nombre: empresaActual.nombre,
    tagline: empresaActual.tagline ?? "",
    telefono: empresaActual.telefono ?? "",
    email: empresaActual.email ?? "",
    direccion: empresaActual.direccion ?? "",
    ciudad: empresaActual.ciudad ?? "",
    provincia: empresaActual.provincia ?? "",
    cuit: empresaActual.cuit ?? "",
    autoEliminarPresupuestosEntregados:
      formData.get("autoEliminarPresupuestosEntregados") === "true",
    mesesRetencionPresupuestoEntregado: Math.max(
      1,
      Number(normalize(formData, "mesesRetencionPresupuestoEntregado")) || 3
    ),
  });

  revalidatePath("/configuracion");
  redirect("/configuracion?saved=1");
}

export async function runPresupuestosCleanupNowAction() {
  const session = await getSession();
  const role = session?.role;

  if (role !== "admin" && role !== "superuser") {
    redirect("/configuracion");
  }

  const result = await cleanupExpiredPresupuestosEntregados();

  revalidatePath("/configuracion");

  if (!result.enabled) {
    redirect("/configuracion?cleanup=disabled");
  }

  redirect(`/configuracion?cleanup=done&deleted=${result.deletedCount}`);
}
