"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionWithPermisos, isSuperAdmin } from "@/lib/permisos";
import {
  getEmpresaConfig,
  normalizeBusinessDaysThresholds,
  upsertEmpresaConfig,
} from "@/lib/queries/empresa";
import { cleanupExpiredPresupuestosEntregados } from "@/lib/maintenance/trabajos-cleanup";

function normalize(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function normalizeNumber(formData: FormData, key: string) {
  const value = normalize(formData, key);
  return value === "" ? Number.NaN : Number(value);
}

export async function updateEmpresaConfigAction(formData: FormData) {
  const { session } = await getSessionWithPermisos();
  if (!isSuperAdmin(session)) redirect("/configuracion");

  const nombre = normalize(formData, "nombre");

  if (!nombre) {
    redirect("/configuracion?error=nombre");
  }

  const empresaActual = await getEmpresaConfig();

  await upsertEmpresaConfig({
    nombre,
    tagline: normalize(formData, "tagline"),
    telefono: normalize(formData, "telefono"),
    email: normalize(formData, "email"),
    direccion: normalize(formData, "direccion"),
    ciudad: normalize(formData, "ciudad"),
    provincia: normalize(formData, "provincia"),
    cuit: normalize(formData, "cuit"),
    autoEliminarPresupuestosEntregados: empresaActual.autoEliminarPresupuestosEntregados,
    mesesRetencionPresupuestoEntregado: empresaActual.mesesRetencionPresupuestoEntregado,
    diasHabilesUmbralVerde: empresaActual.diasHabilesUmbralVerde,
    diasHabilesUmbralNaranja: empresaActual.diasHabilesUmbralNaranja,
  });

  revalidatePath("/configuracion");
  redirect("/configuracion?saved=1");
}

export async function updateEmpresaCleanupConfigAction(formData: FormData) {
  const { session } = await getSessionWithPermisos();
  if (!isSuperAdmin(session)) redirect("/configuracion");

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
    diasHabilesUmbralVerde: empresaActual.diasHabilesUmbralVerde,
    diasHabilesUmbralNaranja: empresaActual.diasHabilesUmbralNaranja,
  });

  revalidatePath("/configuracion");
  redirect("/configuracion?saved=1");
}

export async function updateEmpresaBusinessDaysConfigAction(formData: FormData) {
  const { session } = await getSessionWithPermisos();
  if (!isSuperAdmin(session)) redirect("/configuracion");

  const empresaActual = await getEmpresaConfig();
  const thresholds = normalizeBusinessDaysThresholds({
    verde: normalizeNumber(formData, "diasHabilesUmbralVerde"),
    naranja: normalizeNumber(formData, "diasHabilesUmbralNaranja"),
  });

  await upsertEmpresaConfig({
    nombre: empresaActual.nombre,
    tagline: empresaActual.tagline ?? "",
    telefono: empresaActual.telefono ?? "",
    email: empresaActual.email ?? "",
    direccion: empresaActual.direccion ?? "",
    ciudad: empresaActual.ciudad ?? "",
    provincia: empresaActual.provincia ?? "",
    cuit: empresaActual.cuit ?? "",
    autoEliminarPresupuestosEntregados: empresaActual.autoEliminarPresupuestosEntregados,
    mesesRetencionPresupuestoEntregado: empresaActual.mesesRetencionPresupuestoEntregado,
    ...thresholds,
  });

  revalidatePath("/configuracion");
  redirect("/configuracion?saved=1");
}

export async function runPresupuestosCleanupNowAction() {
  const { session } = await getSessionWithPermisos();
  if (!isSuperAdmin(session)) redirect("/configuracion");

  const result = await cleanupExpiredPresupuestosEntregados();

  revalidatePath("/configuracion");

  if (!result.enabled) {
    redirect("/configuracion?cleanup=disabled");
  }

  redirect(`/configuracion?cleanup=done&deleted=${result.deletedCount}`);
}
