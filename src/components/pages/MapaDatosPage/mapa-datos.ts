/**
 * Recorridos de datos del sistema.
 *
 * Cada flujo responde una pregunta concreta que aparece sola cuando se opera
 * la app. Los pasos reflejan el esquema real de `migrations/` y los accesos
 * de `src/lib/queries/`. Al cambiar una tabla o una relación, actualizar acá.
 */

export type ZonaId = "tecnica" | "catalogo" | "operacion" | "salidas" | "admin";

export type Zona = {
  id: ZonaId;
  nombre: string;
  corto: string;
};

export const ZONAS: Record<ZonaId, Zona> = {
  tecnica: { id: "tecnica", nombre: "Base técnica externa", corto: "Técnica" },
  catalogo: { id: "catalogo", nombre: "Catálogos de precios", corto: "Catálogo" },
  operacion: { id: "operacion", nombre: "Operación", corto: "Operación" },
  salidas: { id: "salidas", nombre: "Salidas", corto: "Salida" },
  admin: { id: "admin", nombre: "Administración", corto: "Admin" },
};

/** `escribe` crea o modifica filas; `lee` sólo consulta; `intacto` se muestra para explicar qué NO cambia. */
export type AccionPaso = "escribe" | "lee" | "intacto";

export type Paso = {
  n: number;
  titulo: string;
  /** Nombre de tabla real, o null si el paso es una pantalla o un proceso. */
  tabla: string | null;
  zona: ZonaId;
  accion: AccionPaso;
  que: string;
  columnas: string[];
};

export type Nota = {
  /** Aparece después de este número de paso. */
  despuesDe: number;
  tono: "clave" | "cuidado";
  titulo: string;
  texto: string;
};

export type Flujo = {
  id: string;
  nombre: string;
  pregunta: string;
  respuesta: string;
  pasos: Paso[];
  notas: Nota[];
  archivos: string[];
};

export const FLUJOS: Flujo[] = [
  {
    id: "alta",
    nombre: "Alta de trabajo",
    pregunta: "¿Qué queda guardado cuando cargo un trabajo nuevo?",
    respuesta:
      "Además de los ids, se copia una foto del nombre del vehículo y del precio de cada ítem. Esa copia es la que se lee después.",
    pasos: [
      {
        n: 1,
        titulo: "Se elige el cliente",
        tabla: "clientes",
        zona: "operacion",
        accion: "lee",
        que: "Se busca por nombre con el autocomplete, o se crea uno nuevo en el momento.",
        columnas: ["id", "nombre", "apellido", "telefono"],
      },
      {
        n: 2,
        titulo: "Se elige el vehículo",
        tabla: "marcas · modelos · motores",
        zona: "tecnica",
        accion: "lee",
        que: "Sale de la base técnica externa, que es otra instancia de Neon. Las marcas con hidden = true no aparecen.",
        columnas: ["marcas.id", "modelos.marca_id", "vehiculos.motor_id"],
      },
      {
        n: 3,
        titulo: "Se crea la orden",
        tabla: "ordenes_trabajo",
        zona: "operacion",
        accion: "escribe",
        que: "Se guarda el id del vehículo y, al lado, su nombre en texto. Los dos.",
        columnas: [
          "numero_trabajo",
          "cliente_id",
          "marca_id",
          "marca_nombre_snapshot",
          "modelo_nombre_snapshot",
          "motor_nombre_snapshot",
          "lista_precio",
        ],
      },
      {
        n: 4,
        titulo: "Se tildan los trabajos",
        tabla: "trabajos",
        zona: "catalogo",
        accion: "lee",
        que: "Del tarifario se lee la columna de la lista elegida en el paso 3. Si la orden usa la lista 2, se lee precio_lista_2.",
        columnas: ["nombre", "precio_lista_1 … precio_lista_5"],
      },
      {
        n: 5,
        titulo: "Se guarda cada ítem",
        tabla: "orden_trabajo_trabajos",
        zona: "operacion",
        accion: "escribe",
        que: "Una fila por trabajo tildado, con el precio ya resuelto adentro.",
        columnas: ["trabajo_id", "cantidad", "precio_snapshot", "trabajo_nombre_snapshot"],
      },
      {
        n: 6,
        titulo: "Se cargan los repuestos",
        tabla: "orden_trabajo_repuestos",
        zona: "operacion",
        accion: "escribe",
        que: "El precio del repuesto se decide acá, por trabajo. El catálogo de repuestos es sólo una referencia.",
        columnas: ["repuesto_id", "precio", "cantidad", "repuesto_nombre_snapshot"],
      },
    ],
    notas: [
      {
        despuesDe: 3,
        tono: "clave",
        titulo: "Por qué se guarda el nombre y no sólo el id",
        texto:
          "La base principal no tiene claves foráneas hacia la base técnica (se quitaron en la migración 010) porque son instancias separadas. Si mañana se renombra una marca o se la oculta, la orden vieja sigue mostrando el nombre correcto porque lo tiene escrito.",
      },
      {
        despuesDe: 5,
        tono: "clave",
        titulo: "Acá se congela el precio",
        texto:
          "precio_snapshot guarda el valor del momento. Al leer, la consulta hace COALESCE(precio_snapshot, precio_lista_N): si hay snapshot, gana el snapshot. Este es el mecanismo que explica el flujo siguiente.",
      },
    ],
    archivos: [
      "src/app/(app)/trabajos/nuevo/page.tsx",
      "src/lib/queries/trabajos.ts",
      "src/lib/queries/catalogo.ts",
    ],
  },
  {
    id: "precios",
    nombre: "Ajuste de precios",
    pregunta: "Si subo el tarifario un 15%, ¿se me actualizan los presupuestos ya entregados?",
    respuesta: "No. Los trabajos ya cargados mantienen el precio que tenían. El ajuste sólo afecta a los que se carguen de ahora en adelante.",
    pasos: [
      {
        n: 1,
        titulo: "Se define el porcentaje",
        tabla: null,
        zona: "catalogo",
        accion: "lee",
        que: "En /precios, cada click del Incrementor suma o resta 0,1%. El acumulado se aplica siempre sobre el precio original de la base, no sobre el del click anterior.",
        columnas: [],
      },
      {
        n: 2,
        titulo: "Se reescribe el tarifario",
        tabla: "trabajos",
        zona: "catalogo",
        accion: "escribe",
        que: "Al guardar se pisan las columnas de precio de todos los trabajos de la categoría. Los valores quedan redondeados a entero.",
        columnas: ["precio_lista_1 … precio_lista_5"],
      },
      {
        n: 3,
        titulo: "Se registra el ajuste",
        tabla: "ajustes_lista_precios",
        zona: "catalogo",
        accion: "escribe",
        que: "Queda una fila con el porcentaje aplicado a cada lista y la fecha. Es bitácora: no recalcula nada por su cuenta.",
        columnas: ["categoria_nombre", "ajuste_lista_1 … 5", "created_at"],
      },
      {
        n: 4,
        titulo: "Los trabajos viejos no se tocan",
        tabla: "orden_trabajo_trabajos",
        zona: "operacion",
        accion: "intacto",
        que: "Ninguna consulta del ajuste escribe en esta tabla. Los precios congelados en el alta siguen tal cual.",
        columnas: ["precio_snapshot"],
      },
    ],
    notas: [
      {
        despuesDe: 4,
        tono: "cuidado",
        titulo: "El corte es el momento del alta, no el de la aprobación",
        texto:
          "Un presupuesto cargado antes del ajuste y aprobado después conserva el precio viejo. Si hace falta pasarlo a la tarifa nueva, hay que reabrirlo y volver a cargar los ítems, no alcanza con reabrirlo.",
      },
    ],
    archivos: ["src/app/(app)/precios/actions.ts", "src/lib/queries/ajustes.ts"],
  },
  {
    id: "cobro",
    nombre: "Cobro y estadísticas",
    pregunta: "¿Sobre qué fecha agrupan los reportes por período?",
    respuesta: "Sobre fecha_cobrado, que se sella al marcar el trabajo como cobrado. Nunca sobre la fecha de creación.",
    pasos: [
      {
        n: 1,
        titulo: "Se marca como cobrado",
        tabla: "ordenes_trabajo",
        zona: "operacion",
        accion: "escribe",
        que: "El toggle de cobrado viaja con el resto del formulario en el único botón Guardar. Al pasar a true se sella la fecha.",
        columnas: ["cobrado", "fecha_cobrado", "updated_at"],
      },
      {
        n: 2,
        titulo: "Se agregan los totales",
        tabla: null,
        zona: "salidas",
        accion: "lee",
        que: "Las consultas de estadísticas agrupan por año y por mes de fecha_cobrado, y suman los precios congelados de los ítems.",
        columnas: [],
      },
      {
        n: 3,
        titulo: "Se muestran los indicadores",
        tabla: null,
        zona: "salidas",
        accion: "lee",
        que: "Barras por mes, resumen anual, distribución por estado y prioridad, y el historial de ajustes del flujo anterior.",
        columnas: [],
      },
    ],
    notas: [
      {
        despuesDe: 1,
        tono: "cuidado",
        titulo: "Un trabajo puede contar en un mes distinto al que se hizo",
        texto:
          "Si se carga en diciembre y se cobra en enero, aparece en enero. Es lo correcto para mirar ingresos, pero no sirve para medir volumen de taller: para eso hay que mirar la fecha de creación, que es otra columna.",
      },
    ],
    archivos: ["src/lib/queries/estadisticas.ts", "migrations/034_add_fecha_cobrado.sql"],
  },
  {
    id: "salidas",
    nombre: "PDF y etiqueta",
    pregunta: "¿De dónde salen los datos del presupuesto impreso?",
    respuesta: "De la orden y sus ítems congelados, más los datos de la empresa. No se guarda ninguna copia del PDF.",
    pasos: [
      {
        n: 1,
        titulo: "Se pide el documento",
        tabla: null,
        zona: "salidas",
        accion: "lee",
        que: "La ruta recibe el id del trabajo, valida la sesión y arma todo en el momento.",
        columnas: [],
      },
      {
        n: 2,
        titulo: "Se leen la orden y sus ítems",
        tabla: "ordenes_trabajo",
        zona: "operacion",
        accion: "lee",
        que: "Con los ítems de trabajo y de repuesto. Todo sale de los valores congelados, así el PDF de hace un año se reimprime igual que el original.",
        columnas: ["numero_trabajo", "aplica_iva", "precio_snapshot", "cantidad"],
      },
      {
        n: 3,
        titulo: "Se agrega el encabezado",
        tabla: "empresa_configuracion",
        zona: "admin",
        accion: "lee",
        que: "Razón social, dirección y contacto. Esta parte sí refleja el valor actual, no una copia histórica.",
        columnas: ["nombre", "direccion", "telefono", "email"],
      },
      {
        n: 4,
        titulo: "Se genera el archivo",
        tabla: null,
        zona: "salidas",
        accion: "lee",
        que: "El PDF se renderiza en memoria y se devuelve con Cache-Control no-store. La etiqueta usa el mismo origen y le suma un QR a la URL del trabajo.",
        columnas: [],
      },
    ],
    notas: [
      {
        despuesDe: 3,
        tono: "cuidado",
        titulo: "El encabezado no está congelado",
        texto:
          "Si cambia la dirección de la empresa, los presupuestos viejos que se reimpriman salen con la dirección nueva. A diferencia de los precios, este dato no se copia en la orden.",
      },
    ],
    archivos: [
      "src/app/api/trabajos/[id]/pdf/route.ts",
      "src/lib/pdf/PresupuestoPdf.tsx",
      "src/lib/qr.ts",
    ],
  },
];

/** Referencia de tablas para el glosario del pie. */
export type TablaRef = {
  tabla: string;
  zona: ZonaId;
  que: string;
};

export const TABLAS: TablaRef[] = [
  { tabla: "clientes", zona: "operacion", que: "Datos de contacto. Si se borra, sus órdenes quedan con cliente_id en NULL." },
  { tabla: "ordenes_trabajo", zona: "operacion", que: "La entidad central. Estado, prioridad, cobro, lista de precios y vehículo congelado." },
  { tabla: "orden_trabajo_trabajos", zona: "operacion", que: "Un renglón por trabajo del presupuesto, con su precio congelado." },
  { tabla: "orden_trabajo_repuestos", zona: "operacion", que: "Un renglón por repuesto, con precio y cantidad propios." },
  { tabla: "trabajos", zona: "catalogo", que: "El tarifario. Cinco precios por trabajo, uno por lista." },
  { tabla: "categorias_trabajo", zona: "catalogo", que: "Agrupan el tarifario. Borrarlas borra sus trabajos en cascada." },
  { tabla: "repuestos", zona: "catalogo", que: "Catálogo de referencia. El precio final se decide por trabajo." },
  { tabla: "categorias_repuesto", zona: "catalogo", que: "Agrupan los repuestos." },
  { tabla: "ajustes_lista_precios", zona: "catalogo", que: "Bitácora de ajustes porcentuales por categoría." },
  { tabla: "marcas · modelos · motores · vehiculos", zona: "tecnica", que: "Catálogo de vehículos en una base separada, sin claves foráneas hacia acá." },
  { tabla: "usuarios", zona: "admin", que: "Acceso de empleados. Rol super_admin u operario." },
  { tabla: "usuario_permisos", zona: "admin", que: "Una fila por permiso otorgado a un operario." },
  { tabla: "empresa_configuracion", zona: "admin", que: "Datos de la empresa que encabezan PDF y etiqueta." },
];
