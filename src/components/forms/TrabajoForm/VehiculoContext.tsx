"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type VehiculoContextValue = {
  marcaNombre: string | null;
  modeloNombre: string | null;
  motorNombre: string | null;
  setVehiculo: (marca: string | null, modelo: string | null, motor: string | null) => void;
};

const VehiculoContext = createContext<VehiculoContextValue | null>(null);

export function VehiculoProvider({
  initialMarca,
  initialModelo,
  initialMotor,
  children,
}: {
  initialMarca: string | null;
  initialModelo: string | null;
  initialMotor: string | null;
  children: ReactNode;
}) {
  const [marcaNombre, setMarcaNombre] = useState(initialMarca);
  const [modeloNombre, setModeloNombre] = useState(initialModelo);
  const [motorNombre, setMotorNombre] = useState(initialMotor);

  function setVehiculo(marca: string | null, modelo: string | null, motor: string | null) {
    setMarcaNombre(marca);
    setModeloNombre(modelo);
    setMotorNombre(motor);
  }

  return (
    <VehiculoContext value={{ marcaNombre, modeloNombre, motorNombre, setVehiculo }}>
      {children}
    </VehiculoContext>
  );
}

export function useVehiculo() {
  const ctx = useContext(VehiculoContext);
  if (!ctx) throw new Error("useVehiculo must be used inside VehiculoProvider");
  return ctx;
}
