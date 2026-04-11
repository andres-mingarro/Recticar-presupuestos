"use server";

import { revalidatePath } from "next/cache";
import {
  createCategoria,
  createTrabajo,
  deleteCategoria,
  deleteTrabajo,
  renameCategoria,
  reorderTrabajos,
  updateTrabajoNombres,
  updateTrabajoPrecios,
} from "@/lib/queries/catalogo";

export type CatalogActionState = { error: string | null; resetKey?: number; success?: boolean };

function normalize(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function updateCategoriaTrabajos(
  _prev: CatalogActionState,
  formData: FormData
): Promise<CatalogActionState> {
  const nombreUpdates: Array<{ id: number; nombre: string }> = [];
  const precioUpdates = new Map<
    number,
    { id: number; precioLista1: number; precioLista2: number; precioLista3: number }
  >();

  for (const [key, value] of formData.entries()) {
    if (key.startsWith("nombre_")) {
      const id = Number(key.replace("nombre_", ""));
      const nombre = typeof value === "string" ? value.trim() : "";
      if (!Number.isNaN(id) && nombre) nombreUpdates.push({ id, nombre });
    }
    if (key.startsWith("precio_lista_")) {
      const [, , lista, rawId] = key.split("_");
      const id = Number(rawId);
      const precio = Number(value);

      if (Number.isNaN(id) || Number.isNaN(precio) || precio < 0) {
        continue;
      }

      const current =
        precioUpdates.get(id) ?? { id, precioLista1: 0, precioLista2: 0, precioLista3: 0 };

      if (lista === "1") current.precioLista1 = precio;
      if (lista === "2") current.precioLista2 = precio;
      if (lista === "3") current.precioLista3 = precio;

      precioUpdates.set(id, current);
    }
  }

  try {
    if (nombreUpdates.length > 0) await updateTrabajoNombres(nombreUpdates);
    if (precioUpdates.size > 0) await updateTrabajoPrecios(Array.from(precioUpdates.values()));
  } catch {
    return { error: "No se pudieron guardar los cambios. Probá nuevamente." };
  }

  revalidatePath("/precios");
  return { error: null, success: true };
}

export async function createCategoriaAction(
  _prev: CatalogActionState,
  formData: FormData
): Promise<CatalogActionState> {
  const nombre = normalize(formData, "nombre");
  if (!nombre) return { error: "El nombre es requerido." };

  try {
    await createCategoria(nombre);
  } catch {
    return { error: "No se pudo crear la categoría." };
  }

  revalidatePath("/precios");
  return { error: null, resetKey: Date.now() };
}

export async function renameCategoriaAction(
  _prev: CatalogActionState,
  formData: FormData
): Promise<CatalogActionState> {
  const id = Number(normalize(formData, "categoriaId"));
  const nombre = normalize(formData, "nombre");

  if (!nombre) return { error: "El nombre no puede estar vacío." };
  if (Number.isNaN(id)) return { error: "Categoría inválida." };

  try {
    await renameCategoria(id, nombre);
  } catch {
    return { error: "No se pudo renombrar la categoría." };
  }

  revalidatePath("/precios");
  return { error: null };
}

export async function deleteCategoriaAction(
  _prev: CatalogActionState,
  formData: FormData
): Promise<CatalogActionState> {
  const id = Number(normalize(formData, "categoriaId"));
  if (Number.isNaN(id)) return { error: "Categoría inválida." };

  try {
    await deleteCategoria(id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo eliminar la categoría." };
  }

  revalidatePath("/precios");
  return { error: null };
}

export async function createTrabajoAction(
  _prev: CatalogActionState,
  formData: FormData
): Promise<CatalogActionState> {
  const categoriaId = Number(normalize(formData, "categoriaId"));
  const nombre = normalize(formData, "nombre");

  if (!nombre) return { error: "El nombre es requerido." };
  if (Number.isNaN(categoriaId)) return { error: "Categoría inválida." };

  try {
    await createTrabajo(categoriaId, nombre);
  } catch {
    return { error: "No se pudo crear el trabajo." };
  }

  revalidatePath("/precios");
  return { error: null, resetKey: Date.now() };
}

export async function reorderTrabajosAction(orderedIds: number[]): Promise<void> {
  await reorderTrabajos(orderedIds);
  revalidatePath("/precios");
}

export async function deleteTrabajoAction(
  _prev: CatalogActionState,
  formData: FormData
): Promise<CatalogActionState> {
  const id = Number(normalize(formData, "trabajoId"));
  if (Number.isNaN(id)) return { error: "Trabajo inválido." };

  try {
    await deleteTrabajo(id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo eliminar el trabajo." };
  }

  revalidatePath("/precios");
  return { error: null };
}
