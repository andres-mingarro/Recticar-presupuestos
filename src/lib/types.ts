export const TRABAJO_ESTADOS = ["pendiente", "aprobado", "finalizado"] as const;
export const TRABAJO_PRIORIDADES = ["baja", "normal", "alta"] as const;

export type TrabajoEstado = (typeof TRABAJO_ESTADOS)[number];
export type TrabajoPrioridad = (typeof TRABAJO_PRIORIDADES)[number];

export type ClienteListItem = {
  id: number;
  numero_cliente: number;
  nombre: string;
  apellido: string;
  telefono: string | null;
  fecha_alta: string;
};

export type ClienteDetail = ClienteListItem & {
  direccion: string | null;
  ciudad: string | null;
  provincia: string | null;
  cp: string | null;
  mail: string | null;
  dni: string | null;
  cuit: string | null;
};

export type ClientePendingTrabajoItem = {
  cliente_id: number;
  id: number;
  numero_trabajo: number;
  cobrado: boolean;
  estado: TrabajoEstado;
  prioridad: TrabajoPrioridad;
  fecha_creacion: string;
  marca_id: number | null;
  modelo_id: number | null;
  motor_id: number | null;
  marca_nombre: string | null;
  modelo_nombre: string | null;
  motor_nombre: string | null;
  numero_serie_motor: string;
};

export type ClienteFormValues = {
  nombre: string;
  apellido: string;
  telefono: string;
  mail: string;
  ciudad: string;
  direccion: string;
  provincia: string;
  cp: string;
  dni: string;
  cuit: string;
};

export type TrabajoListItem = {
  id: number;
  numero_trabajo: number;
  cobrado: boolean;
  estado: TrabajoEstado;
  prioridad: TrabajoPrioridad;
  fecha_creacion: string;
  fecha_aprobacion: string | null;
  cliente_id: number | null;
  cliente_nombre: string | null;
  marca_id: number | null;
  modelo_id: number | null;
  motor_id: number | null;
  marca_nombre: string | null;
  modelo_nombre: string | null;
  motor_nombre: string | null;
  numero_serie_motor: string;
};

export type TrabajoDetail = TrabajoListItem & {
  updated_at: string;
  observaciones: string | null;
  trabajos_ids: number[];
  repuestos_ids: number[];
  repuestos: TrabajoRepuestoValue[];
  lista_precio: 1 | 2 | 3;
  cliente_dni: string | null;
  cliente_cuit: string | null;
  cliente_telefono: string | null;
};

export type ClienteTrabajoItem = TrabajoListItem;

export type TrabajoRepuestoValue = {
  repuestoId: string;
  precioUnitario: number;
  cantidad: number;
};

export type TrabajoFormValues = {
  updatedAt?: string;
  clienteId: string;
  marcaId: string;
  modeloId: string;
  motorId: string;
  numeroSerieMotor: string;
  cobrado: boolean;
  prioridad: TrabajoPrioridad;
  estado: TrabajoEstado;
  observaciones: string;
  trabajosIds: string[];
  repuestosIds: string[];
  repuestos: TrabajoRepuestoValue[];
  listaPrecios: 1 | 2 | 3;
};

export type Marca = {
  id: number;
  nombre: string;
};

export type Modelo = {
  id: number;
  nombre: string;
  marca_id?: number;
};

export type Motor = {
  id: number;
  nombre: string;
};

export type ModeloMotorRelation = {
  modelo_id: number;
  motor_id: number;
};

export type TechnicalMarca = {
  id: number;
  nombre: string;
  hidden: boolean;
};

export type TechnicalModelo = {
  id: number;
  nombre: string;
  marcaId: number;
  marcaNombre: string | null;
};

export type TechnicalMotor = {
  id: number;
  nombre: string;
  cilindrada: string | null;
};

export type TechnicalVehiculo = {
  id: number;
  modeloId: number;
  modeloNombre: string;
  marcaNombre: string | null;
  motorId: number;
  motorNombre: string;
  hidden: boolean;
};

export type TrabajoAgrupado = {
  categoriaId: number;
  categoriaNombre: string;
  trabajos: Array<{
    id: number;
    nombre: string;
    precio: number;
    precioLista1: number;
    precioLista2: number;
    precioLista3: number;
  }>;
};

export type RepuestoAgrupado = {
  categoriaId: number;
  categoriaNombre: string;
  repuestos: Array<{
    id: number;
    nombre: string;
    precio: number;
  }>;
};
