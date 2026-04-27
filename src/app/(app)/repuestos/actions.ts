"use server";

import { revalidatePath } from "next/cache";
import {
  createCategoriaRepuesto,
  createRepuesto,
  deleteCategoriaRepuesto,
  deleteRepuesto,
  renameCategoriaRepuesto,
  reorderRepuestos,
  updateRepuestoNombres,
  updateRepuestoStock,
} from "@/lib/queries/repuestos";

export type RepuestosActionState = {
  error: string | null;
  resetKey?: number;
  success?: boolean;
};

function normalize(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function updateCategoriaRepuestos(
  _prev: RepuestosActionState,
  formData: FormData
): Promise<RepuestosActionState> {
  const nombreUpdates: Array<{ id: number; nombre: string }> = [];
  const stockUpdates: Array<{ id: number; stockHabilitado: boolean; stockCantidad: number; precioStock: number }> = [];
  const repuestoIds = new Set<number>();

  for (const [key] of formData.entries()) {
    if (key.startsWith("nombre_")) {
      const id = Number(key.replace("nombre_", ""));
      if (!Number.isNaN(id)) repuestoIds.add(id);
    }
  }

  for (const id of repuestoIds) {
    const nombre = typeof formData.get(`nombre_${id}`) === "string"
      ? (formData.get(`nombre_${id}`) as string).trim()
      : "";
    if (nombre) nombreUpdates.push({ id, nombre });

    const stockHabilitado = formData.get(`stock_habilitado_${id}`) === "true";
    const stockCantidad = Math.max(0, Math.trunc(Number(formData.get(`stock_cantidad_${id}`)) || 0));
    const precioStock = Math.max(0, Math.trunc(Number(formData.get(`precio_stock_${id}`)) || 0));
    stockUpdates.push({ id, stockHabilitado, stockCantidad, precioStock });
  }

  const categoriaId = Number(formData.get("categoriaId"));
  const categoriaNombre = normalize(formData, "nombre");

  try {
    if (!Number.isNaN(categoriaId) && categoriaNombre) {
      await renameCategoriaRepuesto(categoriaId, categoriaNombre);
    }
    if (nombreUpdates.length > 0) await updateRepuestoNombres(nombreUpdates);
    if (stockUpdates.length > 0) await updateRepuestoStock(stockUpdates);
  } catch {
    return { error: "No se pudieron guardar los cambios. Probá nuevamente." };
  }

  revalidatePath("/repuestos");
  return { error: null, success: true };
}

export async function createCategoriaRepuestoAction(
  _prev: RepuestosActionState,
  formData: FormData
): Promise<RepuestosActionState> {
  const nombre = normalize(formData, "nombre");
  if (!nombre) return { error: "El nombre es requerido." };

  try {
    await createCategoriaRepuesto(nombre);
  } catch {
    return { error: "No se pudo crear la categoría." };
  }

  revalidatePath("/repuestos");
  return { error: null, resetKey: Date.now() };
}

export async function renameCategoriaRepuestoAction(
  _prev: RepuestosActionState,
  formData: FormData
): Promise<RepuestosActionState> {
  const id = Number(normalize(formData, "categoriaId"));
  const nombre = normalize(formData, "nombre");

  if (!nombre) return { error: "El nombre no puede estar vacío." };
  if (Number.isNaN(id)) return { error: "Categoría inválida." };

  try {
    await renameCategoriaRepuesto(id, nombre);
  } catch {
    return { error: "No se pudo renombrar la categoría." };
  }

  revalidatePath("/repuestos");
  return { error: null };
}

export async function deleteCategoriaRepuestoAction(
  _prev: RepuestosActionState,
  formData: FormData
): Promise<RepuestosActionState> {
  const id = Number(normalize(formData, "categoriaId"));
  if (Number.isNaN(id)) return { error: "Categoría inválida." };

  try {
    await deleteCategoriaRepuesto(id);
  } catch {
    return { error: "No se pudo eliminar la categoría." };
  }

  revalidatePath("/repuestos");
  return { error: null };
}

export async function createRepuestoAction(
  _prev: RepuestosActionState,
  formData: FormData
): Promise<RepuestosActionState> {
  const categoriaId = Number(normalize(formData, "categoriaId"));
  const nombre = normalize(formData, "nombre");

  if (!nombre) return { error: "El nombre es requerido." };
  if (Number.isNaN(categoriaId)) return { error: "Categoría inválida." };

  try {
    await createRepuesto(categoriaId, nombre);
  } catch {
    return { error: "No se pudo crear el repuesto." };
  }

  revalidatePath("/repuestos");
  return { error: null, resetKey: Date.now() };
}

export async function reorderRepuestosAction(orderedIds: number[]): Promise<void> {
  await reorderRepuestos(orderedIds);
  revalidatePath("/repuestos");
}

export async function deleteRepuestoAction(
  _prev: RepuestosActionState,
  formData: FormData
): Promise<RepuestosActionState> {
  const id = Number(normalize(formData, "repuestoId"));
  if (Number.isNaN(id)) return { error: "Repuesto inválido." };

  try {
    await deleteRepuesto(id);
  } catch {
    return { error: "No se pudo eliminar el repuesto." };
  }

  revalidatePath("/repuestos");
  return { error: null };
}
