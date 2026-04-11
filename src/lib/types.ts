export const PEDIDO_ESTADOS = ["pendiente", "aprobado", "finalizado"] as const;
export const PEDIDO_PRIORIDADES = ["baja", "normal", "alta"] as const;

export type PedidoEstado = (typeof PEDIDO_ESTADOS)[number];
export type PedidoPrioridad = (typeof PEDIDO_PRIORIDADES)[number];

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
};

export type ClientePendingPedidoItem = {
  cliente_id: number;
  id: number;
  numero_pedido: number;
  estado: PedidoEstado;
  prioridad: PedidoPrioridad;
  fecha_creacion: string;
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
};

export type PedidoListItem = {
  id: number;
  numero_pedido: number;
  estado: PedidoEstado;
  prioridad: PedidoPrioridad;
  fecha_creacion: string;
  fecha_aprobacion: string | null;
  cliente_id: number | null;
  cliente_nombre: string | null;
  marca_nombre: string | null;
  modelo_nombre: string | null;
  motor_nombre: string | null;
  numero_serie_motor: string;
};

export type PedidoDetail = PedidoListItem & {
  observaciones: string | null;
  trabajos_ids: number[];
};

export type ClientePedidoItem = PedidoListItem;

export type PedidoFormValues = {
  clienteId: string;
  marcaId: string;
  modeloId: string;
  motorId: string;
  numeroSerieMotor: string;
  prioridad: PedidoPrioridad;
  estado: PedidoEstado;
  observaciones: string;
  trabajosIds: string[];
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

export type TrabajoAgrupado = {
  categoriaId: number;
  categoriaNombre: string;
  trabajos: Array<{
    id: number;
    nombre: string;
    precio: number;
  }>;
};
