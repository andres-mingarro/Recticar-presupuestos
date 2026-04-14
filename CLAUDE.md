@AGENTS.md

---

## Estado actual del proyecto

App interna para gestión de pedidos de rectificación de motores. Empleados logueados (no clientes). Stack: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4, SCSS Modules por componente, PostgreSQL (Neon serverless).

---

## Stack

- Next.js 15 con App Router
- TypeScript
- Tailwind CSS v4 + SCSS Modules por componente
- Neon PostgreSQL con `@neondatabase/serverless`
- `qrcode` para generar SVG de etiquetas
- Font Awesome para iconografía (via `src/components/ui/Icon`)
- Sin ORM — SQL directo con `queryRows<T>()`

---

## Bases de datos

- `DATABASE_URL` → base principal: clientes, pedidos, trabajos, usuarios
- `TECHNICAL_DATABASE_URL` → catálogo técnico externo usado en "Selección técnica" (marcas, modelos, motores, vehículos). Si no está definida, hace fallback a `DATABASE_URL`.
- La base principal **no depende por FK** de marcas/modelos/motores para guardar pedidos.
- Tablas esperadas en la base técnica: `marcas(id, nombre)`, `modelos(id, nombre, marca_id)`, `motores(id, nombre, cilindrada)`, `vehiculos(id, modelo_id, motor_id)`.

---

## Convenciones obligatorias

### Componentes
- **Todo componente tiene su nombre como className** en el elemento raíz. Ej: `<div className="CobradoToggle flex-1">`.
- Cada componente vive en su propia carpeta con `index.ts` y su `*.module.scss`.
- Los archivos de componentes viven en `src/components/` organizados por tipo (`ui/`, `forms/`, `pages/`, `layout/`, `navigation/`, `search/`, `pagination/`, `sortable/`).
- Reutilizar `Card`, `Button`, `Badge`, `Table` y `PageHeader` antes de crear estilos nuevos.
- Para toggles y segmentados, priorizar `ButtonGroup`, `Tabs`, `Incrementor`, `CobradoToggle`, `PrioridadToggle` y `EstadoStepper`.
- Los iconos deben pasar por `src/components/ui/Icon` — no SVG inline salvo casos muy puntuales.

### Formularios y guardado
- **Los cambios siempre se guardan con un único botón "Guardar"**. No hay auto-save ni acciones individuales por widget dentro del detalle de pedido.
- Los widgets fuera del `<form>` (toggles de cobrado, prioridad, estado) usan `<input type="hidden" name="..." form={formId} />` para enviar su valor al formulario correcto.
- `useActionState` se levanta al componente padre cuando el padre necesita acceso a `isPending` (ej: `PedidoDetailPage`).

### Feedback visual
- **`Spinner`** (`src/components/ui/Spinner.tsx`): SVG `animate-spin`, se usa en todos los botones de guardar mientras `isPending`.
- **`PulsatingButton`** (`src/components/ui/PulsatingButton.tsx`): botón que pulsa via `box-shadow` animado cuando `pulsing={true}`. Se usa para indicar cambios sin guardar (`dirty && !isPending`). Props: `pulsing`, `variant` (`"pulse"` | `"ripple"`), `distance`, `duration`, `pulseColor`.
- El estado `dirty` se activa con `onClickCapture` en toggles y `onInput` en el form. Se resetea con `useEffect` cuando `isPending` pasa a `true`.

### Valores monetarios
- Los importes se muestran y persisten como **enteros**, sin decimales.

---

## Estructura de rutas

| Ruta | Descripción |
|---|---|
| `src/app/(app)/clientes` | Listado con autocomplete y paginación de 10 resultados |
| `src/app/(app)/clientes/[id]` | Datos del cliente en `PageHeader`; edición en acordeón desde botón EDITAR; pedidos vigentes y finalizados en cards separadas |
| `src/app/(app)/pedidos` | Listado de pedidos |
| `src/app/(app)/pedidos/nuevo` | Alta de pedido; usa base técnica externa para marca/modelo/motor |
| `src/app/(app)/pedidos/[id]` | Edición de pedido; concentra cobrado, prioridad, estado y form en un único guardado |
| `src/app/(app)/pedidos/[id]/etiqueta` | Vista imprimible de etiqueta con QR (sin header ni menú del AppShell) |
| `src/app/(app)/precios` | Administración de trabajos y listas de precios con ajustes porcentuales por categoría (`Incrementor`) |
| `src/app/(app)/informacion-tecnica` | Edición del catálogo técnico externo (marcas, modelos, motores, vehículos); búsqueda y paginación server-side; solo `admin` y `superuser` pueden editar |
| `src/app/api/clientes/search` | Autocomplete de clientes |

---

## Arquitectura de PedidoDetailPage

`PedidoDetailPage` es `"use client"` y centraliza el estado de la pantalla de edición de un pedido.

```
PrioridadProvider
  CobradoProvider
    RepuestosSeleccionProvider
      PedidoDetailPage
        [Top bar]  ← PulsatingButton type="submit" form={formId}
        TrabajosSeleccionProvider
          [PedidoDetailPageMain]
            Card
              CobradoToggle    (form={formId}, onClickCapture → dirty)
              PrioridadToggle  (form={formId}, onClickCapture → dirty)
              EstadoStepper    (form={formId}, onClickCapture → dirty)
            div[onInput → dirty]
              PedidoForm       (externalFormAction, externalState, externalIsPending)
          [PedidoDetailPageSidebar]
            Card (PDF + QR etiqueta con id="etiqueta-qr-print" + PrintButton)
            PedidoDatosCard    (lee CobradoContext + PrioridadContext reactivamente)
            PedidoClienteSection
            Card (Reglas de estado)
```

### Pattern de external state en PedidoForm
`PedidoForm` acepta props opcionales `externalFormAction`, `externalState`, `externalIsPending`. Cuando se proveen, los usa en lugar de llamar a `useActionState` internamente (aunque el hook interno siempre se llama por reglas de React). Esto permite que `PedidoDetailPage` controle `isPending` para el botón top bar.

### Providers de contexto
| Provider | Context | Toggle | Badge |
|---|---|---|---|
| `CobradoProvider` | `CobradoContext` | `CobradoToggle` | `CobradoBadge` |
| `PrioridadProvider` | `PrioridadContext` | `PrioridadToggle` | `PrioridadBadge` |
| `TrabajosSeleccionProvider` | `TrabajosSeleccionContext` | checkboxes en PedidoForm | `TrabajosResumen` |
| `RepuestosSeleccionProvider` | `RepuestosSeleccionContext` | inputs en PedidoForm | resumen en sidebar |

### Pedidos — detalles
- `PedidoForm` usa `PedidoItemCard` y `CheckboxBeauti` para los ítems de trabajos y repuestos.
- Los repuestos guardan `precio` y `cantidad` en `pedido_repuestos`. El catálogo `/repuestos` no define el precio final; ese valor se decide por pedido.
- El PDF y los listados hidratan marca/modelo/motor desde la base técnica externa.

---

## Componentes UI clave

### Botones
- `Button` / `buttonStyles()` — variantes: `primary` (naranja gradient), `secondary`, `ghost`, `dark` (slate gradient).
- `ButtonGroup<T>` — selector multi-opción (Lista 1/2/3, prioridad en nuevo pedido). Props: `options`, `value`, `onChange`, `activeTone` por opción.
- `PulsatingButton` — extiende `buttonStyles`, agrega anillo pulsante.
- `Incrementor` — ajuste porcentual, usado en `/precios`.

### EstadoStepper
Tres estados con gradientes de color progresivos:
- `pendiente` → "Presupuesto entregado" (gradiente naranja claro)
- `aprobado` → "Presupuesto aceptado" (gradiente naranja oscuro)
- `finalizado` → "Pedido finalizado" (gradiente verde)

Existe en dos variantes: `EstadoStepper` (form mode, clickeable) y `EstadoStepperDisplay` (read-only).

### Badges
`StatusBadge`, `PriorityBadge`, `PaymentBadge`, `ContactBadge`, `BusinessDaysBadge` en `src/components/ui/Badge/Badge.tsx`.

### Etiqueta QR y CSS de impresión
El QR se genera server-side con `generateQrSvg()` (`src/lib/qr.ts`). La URL base usa `NEXT_PUBLIC_BASE_URL` (fallback: `http://localhost:3000`).

El botón `PrintButton` llama a `window.print()`.

**CSS Modules no permite selectores globales puros** (`:global(body *)`, `:global(html)`, etc.) — el build falla con "Selector is not pure". Patrón obligatorio:

1. El wrapper de la etiqueta tiene `id="etiqueta-qr-print"` (ID estable, no hasheado por CSS Modules).
2. Las reglas globales viven en `src/app/globals.css` scoped con `body:has(#etiqueta-qr-print)`:
   ```css
   @media print {
     body:has(#etiqueta-qr-print) * { visibility: hidden !important; }
     #etiqueta-qr-print, #etiqueta-qr-print * { visibility: visible !important; }
     #etiqueta-qr-print { position: fixed !important; top: 50% !important; left: 50% !important; transform: translate(-50%, -50%) !important; }
   }
   ```
3. El módulo SCSS solo maneja sizing local (`.etiqueta`, `.etiquetaQr`) — sin `:global()` puros.

---

## Archivos de referencia rápida

| Archivo | Rol |
|---|---|
| `src/app/(app)/pedidos/[id]/page.tsx` | Server page del detalle de pedido; define server actions |
| `src/components/pages/PedidoDetailPage/PedidoDetailPage.tsx` | Client component principal, orquesta el estado |
| `src/components/forms/PedidoForm/PedidoForm.tsx` | Form de edición (trabajos, vehículo, observaciones) |
| `src/components/forms/ClienteForm/ClienteForm.tsx` | Form de cliente (nuevo y edición) |
| `src/lib/queries/pedidos.ts` | `getPedidoDetailById`, `updatePedido`, `listPedidos` |
| `src/lib/queries/catalogo.ts` | `listTrabajosAgrupados`, marcas, modelos, motores |
| `src/lib/qr.ts` | `generateQrSvg(url)` |
| `src/lib/pdf/PresupuestoPdf.tsx` | Componente PDF con `@react-pdf/renderer` |
| `src/app/api/pedidos/[id]/pdf/route.ts` | Route handler PDF (tiene `@ts-expect-error` por React 19 — no tocar) |
| `src/lib/types.ts` | Todos los tipos: `PedidoEstado`, `PedidoDetail`, `TrabajoAgrupado`, etc. |
| `src/lib/db.ts` | `queryRows<T>(sql, params)` — cliente PostgreSQL |
| `src/middleware.ts` | Auth JWT con `jose`; roles: `admin`, `superuser`, `operador` |

---

## Base de datos

- ORM: ninguno. SQL directo con `queryRows<T>()`.
- Migraciones en `migrations/` (numeradas). Aplicar con `npm run db:migrate`.
- Tipos enum en PostgreSQL: `pedido_estado` (`pendiente`, `aprobado`, `finalizado`), `pedido_prioridad` (`baja`, `normal`, `alta`).
- El valor `entregado` existe en el enum (migración 011) pero no se usa en la UI.
- Migración 014: agrega `precio` y `cantidad` a `pedido_repuestos`.
- Al agregar estados nuevos: revisar consistencia entre enum DB, labels del stepper y filtros/listados.

### Scripts útiles
```
npm run db:migrate       # aplica migraciones sobre la base principal
npm run db:reset:dev     # borra clientes y pedidos fake marcados como DEV-SEED
npm run db:seed:dev      # crea 15 clientes fake y 15 pedidos fake
```

---

## Notas de desarrollo

- `export const dynamic = "force-dynamic"` en todas las pages que leen datos de la DB.
- Server actions definidas inline en los page files con `"use server"`.
- `redirect()` de Next.js lanza una excepción internamente — no poner dentro de `try/catch`.
- En WSL2 con archivos en Linux FS nativo, el HMR funciona sin `WATCHPACK_POLLING`.
- `src/middleware.ts` (no en raíz) por la estructura con `src/`.
- Variables de entorno en `.env.local`: `DATABASE_URL`, `TECHNICAL_DATABASE_URL`, `NEXT_PUBLIC_BASE_URL`.
