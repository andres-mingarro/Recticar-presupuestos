"use server";

import { revalidatePath } from "next/cache";
import {
  createTechnicalMarca,
  createTechnicalModelo,
  createTechnicalMotor,
  createTechnicalVehiculo,
  deleteTechnicalMarca,
  deleteTechnicalModelo,
  deleteTechnicalMotor,
  deleteTechnicalVehiculo,
  updateTechnicalMarca,
  updateTechnicalModelo,
  updateTechnicalMotor,
  updateTechnicalVehiculo,
  toggleTechnicalVehiculoHidden,
} from "@/lib/queries/informacion-tecnica";

export type TechnicalActionState = {
  error: string | null;
  resetKey?: number;
  success?: boolean;
};

function normalize(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function revalidateTechnicalPages() {
  revalidatePath("/informacion-tecnica");
  revalidatePath("/trabajos");
  revalidatePath("/trabajos/nuevo");
  revalidatePath("/clientes");
}

export async function createMarcaAction(
  _prev: TechnicalActionState,
  formData: FormData
): Promise<TechnicalActionState> {
  const nombre = normalize(formData, "nombre");
  if (!nombre) return { error: "El nombre es obligatorio." };

  try {
    await createTechnicalMarca(nombre);
  } catch {
    return { error: "No se pudo crear la marca." };
  }

  revalidateTechnicalPages();
  return { error: null, resetKey: Date.now() };
}

export async function updateMarcaAction(
  _prev: TechnicalActionState,
  formData: FormData
): Promise<TechnicalActionState> {
  const id = Number(normalize(formData, "marcaId"));
  const nombre = normalize(formData, "nombre");

  if (Number.isNaN(id)) return { error: "Marca inválida." };
  if (!nombre) return { error: "El nombre es obligatorio." };

  const hiddenRaw = formData.get("hidden");
  const hidden = hiddenRaw === "1" ? true : hiddenRaw === "0" ? false : undefined;

  try {
    await updateTechnicalMarca(id, nombre, hidden);
  } catch {
    return { error: "No se pudo actualizar la marca." };
  }

  revalidateTechnicalPages();
  return { error: null, success: true };
}

export async function deleteMarcaAction(
  _prev: TechnicalActionState,
  formData: FormData
): Promise<TechnicalActionState> {
  const id = Number(normalize(formData, "marcaId"));
  if (Number.isNaN(id)) return { error: "Marca inválida." };

  try {
    await deleteTechnicalMarca(id);
  } catch {
    return { error: "No se pudo eliminar la marca. Revisá si tiene modelos asociados." };
  }

  revalidateTechnicalPages();
  return { error: null };
}

export async function createModeloAction(
  _prev: TechnicalActionState,
  formData: FormData
): Promise<TechnicalActionState> {
  const nombre = normalize(formData, "nombre");
  const marcaId = Number(normalize(formData, "marcaId"));

  if (!nombre) return { error: "El nombre es obligatorio." };
  if (Number.isNaN(marcaId)) return { error: "Marca inválida." };

  try {
    await createTechnicalModelo(nombre, marcaId);
  } catch {
    return { error: "No se pudo crear el modelo." };
  }

  revalidateTechnicalPages();
  return { error: null, resetKey: Date.now() };
}

export async function updateModeloAction(
  _prev: TechnicalActionState,
  formData: FormData
): Promise<TechnicalActionState> {
  const id = Number(normalize(formData, "modeloId"));
  const nombre = normalize(formData, "nombre");
  const marcaId = Number(normalize(formData, "marcaId"));

  if (Number.isNaN(id)) return { error: "Modelo inválido." };
  if (Number.isNaN(marcaId)) return { error: "Marca inválida." };
  if (!nombre) return { error: "El nombre es obligatorio." };

  try {
    await updateTechnicalModelo(id, nombre, marcaId);
  } catch {
    return { error: "No se pudo actualizar el modelo." };
  }

  revalidateTechnicalPages();
  return { error: null, success: true };
}

export async function deleteModeloAction(
  _prev: TechnicalActionState,
  formData: FormData
): Promise<TechnicalActionState> {
  const id = Number(normalize(formData, "modeloId"));
  if (Number.isNaN(id)) return { error: "Modelo inválido." };

  try {
    await deleteTechnicalModelo(id);
  } catch {
    return { error: "No se pudo eliminar el modelo. Revisá si tiene vehículos asociados." };
  }

  revalidateTechnicalPages();
  return { error: null };
}

export async function createMotorAction(
  _prev: TechnicalActionState,
  formData: FormData
): Promise<TechnicalActionState> {
  const nombre = normalize(formData, "nombre");
  const cilindrada = normalize(formData, "cilindrada");

  if (!nombre) return { error: "El nombre es obligatorio." };

  try {
    await createTechnicalMotor(nombre, cilindrada);
  } catch {
    return { error: "No se pudo crear el motor." };
  }

  revalidateTechnicalPages();
  return { error: null, resetKey: Date.now() };
}

export async function updateMotorAction(
  _prev: TechnicalActionState,
  formData: FormData
): Promise<TechnicalActionState> {
  const id = Number(normalize(formData, "motorId"));
  const nombre = normalize(formData, "nombre");
  const cilindrada = normalize(formData, "cilindrada");

  if (Number.isNaN(id)) return { error: "Motor inválido." };
  if (!nombre) return { error: "El nombre es obligatorio." };

  try {
    await updateTechnicalMotor(id, nombre, cilindrada);
  } catch {
    return { error: "No se pudo actualizar el motor." };
  }

  revalidateTechnicalPages();
  return { error: null, success: true };
}

export async function deleteMotorAction(
  _prev: TechnicalActionState,
  formData: FormData
): Promise<TechnicalActionState> {
  const id = Number(normalize(formData, "motorId"));
  if (Number.isNaN(id)) return { error: "Motor inválido." };

  try {
    await deleteTechnicalMotor(id);
  } catch {
    return { error: "No se pudo eliminar el motor. Revisá si tiene vehículos asociados." };
  }

  revalidateTechnicalPages();
  return { error: null };
}

export async function toggleVehiculoHiddenAction(
  _prev: TechnicalActionState,
  formData: FormData
): Promise<TechnicalActionState> {
  const id = Number(normalize(formData, "vehiculoId"));
  const hidden = formData.get("hidden") === "1";

  if (Number.isNaN(id)) return { error: "Vehículo inválido." };

  try {
    await toggleTechnicalVehiculoHidden(id, hidden);
  } catch {
    return { error: "No se pudo actualizar la visibilidad del vehículo." };
  }

  revalidateTechnicalPages();
  return { error: null, success: true };
}

export async function createVehiculoAction(
  _prev: TechnicalActionState,
  formData: FormData
): Promise<TechnicalActionState> {
  const modeloId = Number(normalize(formData, "modeloId"));
  const motorId = Number(normalize(formData, "motorId"));

  if (Number.isNaN(modeloId)) return { error: "Modelo inválido." };
  if (Number.isNaN(motorId)) return { error: "Motor inválido." };

  try {
    await createTechnicalVehiculo(modeloId, motorId);
  } catch {
    return { error: "No se pudo crear la relación vehículo." };
  }

  revalidateTechnicalPages();
  return { error: null, resetKey: Date.now() };
}

export async function updateVehiculoAction(
  _prev: TechnicalActionState,
  formData: FormData
): Promise<TechnicalActionState> {
  const id = Number(normalize(formData, "vehiculoId"));
  const modeloId = Number(normalize(formData, "modeloId"));
  const motorId = Number(normalize(formData, "motorId"));

  if (Number.isNaN(id)) return { error: "Vehículo inválido." };
  if (Number.isNaN(modeloId)) return { error: "Modelo inválido." };
  if (Number.isNaN(motorId)) return { error: "Motor inválido." };

  try {
    await updateTechnicalVehiculo(id, modeloId, motorId);
  } catch {
    return { error: "No se pudo actualizar la relación vehículo." };
  }

  revalidateTechnicalPages();
  return { error: null, success: true };
}

export async function deleteVehiculoAction(
  _prev: TechnicalActionState,
  formData: FormData
): Promise<TechnicalActionState> {
  const id = Number(normalize(formData, "vehiculoId"));
  if (Number.isNaN(id)) return { error: "Vehículo inválido." };

  try {
    await deleteTechnicalVehiculo(id);
  } catch {
    return { error: "No se pudo eliminar la relación vehículo." };
  }

  revalidateTechnicalPages();
  return { error: null };
}
