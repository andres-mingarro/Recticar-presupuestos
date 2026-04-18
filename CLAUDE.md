@AGENTS.md

---

## Estado actual del proyecto

App interna para gestión de trabajos de rectificación de motores. Empleados logueados (no clientes). Stack: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4, SCSS Modules por componente, PostgreSQL (Neon serverless).

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

- `DATABASE_URL` → base principal: clientes, trabajos, trabajos, usuarios
- `TECHNICAL_DATABASE_URL` → catálogo técnico externo usado en "Selección técnica" (marcas, modelos, motores, vehículos). Si no está definida, hace fallback a `DATABASE_URL`.
- La base principal **no depende por FK** de marcas/modelos/motores para guardar trabajos.
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
- **Los cambios siempre se guardan con un único botón "Guardar"**. No hay auto-save ni acciones individuales por widget dentro del detalle de trabajo.
- Los widgets fuera del `<form>` (toggles de cobrado, prioridad, estado) usan `<input type="hidden" name="..." form={formId} />` para enviar su valor al formulario correcto.
- `useActionState` se levanta al componente padre cuando el padre necesita acceso a `isPending` (ej: `TrabajoDetailPage`).

### Paleta de colores
Variables CSS definidas en `src/scss/globals.css`:
- `--orange-vivid`, `--peach-soft`, `--cream-warm`, `--apricot-light`, `--brown-burnt` — paleta naranja/cálida usada en gradientes de botones `primary`, `warm`, `burnt`, `secondary`.

### Feedback visual
- **`Spinner`** (`src/components/ui/Spinner.tsx`): SVG `animate-spin`, se usa en todos los botones de guardar mientras `isPending`.
- **`PulsatingButton`** (`src/components/ui/PulsatingButton.tsx`): usa `Button` internamente, agrega anillo pulsante cuando `pulsing={true}`. Props: `pulsing`, `pulseStyle` (`"pulse"` | `"ripple"`), `distance`, `duration`, `pulseColor`. Acepta todas las props de `Button`.
- El estado `dirty` se activa con `onClickCapture` en toggles y `onInput` en el form. Se resetea con `useEffect` cuando `isPending` pasa a `true`.

### Valores monetarios
- Los importes se muestran y persisten como **enteros**, sin decimales.

---

## Estructura de rutas

| Ruta | Descripción |
|---|---|
| `src/app/(app)/clientes` | Listado con autocomplete y paginación de 10 resultados |
| `src/app/(app)/clientes/[id]` | Datos del cliente en `PageHeader`; edición en acordeón desde botón EDITAR; trabajos vigentes y finalizados en cards separadas |
| `src/app/(app)/trabajos` | Listado de trabajos |
| `src/app/(app)/trabajos/nuevo` | Alta de trabajo; usa base técnica externa para marca/modelo/motor |
| `src/app/(app)/trabajos/[id]` | Edición de trabajo; concentra cobrado, prioridad, estado y form en un único guardado |
| `src/app/(app)/trabajos/[id]/etiqueta` | Vista imprimible de etiqueta con QR (sin header ni menú del AppShell) |
| `src/app/(app)/precios` | Administración de trabajos y listas de precios con ajustes porcentuales por categoría (`Incrementor`) |
| `src/app/(app)/informacion-tecnica` | Edición del catálogo técnico externo (marcas, modelos, motores, vehículos); búsqueda y paginación server-side; solo `admin` y `superuser` pueden editar |
| `src/app/api/clientes/search` | Autocomplete de clientes |

---

## Arquitectura de TrabajoDetailPage

`TrabajoDetailPage` es `"use client"` y centraliza el estado de la pantalla de edición de un trabajo.

```
PrioridadProvider
  CobradoProvider
    RepuestosSeleccionProvider
      TrabajoDetailPage
        [Top bar]  ← PulsatingButton type="submit" form={formId}
        TrabajosSeleccionProvider
          [TrabajoDetailPageMain]
            Card
              CobradoToggle    (form={formId}, onClickCapture → dirty)
              PrioridadToggle  (form={formId}, onClickCapture → dirty)
              EstadoStepper    (form={formId}, onClickCapture → dirty)
            div[onInput → dirty]
              TrabajoForm       (externalFormAction, externalState, externalIsPending)
          [TrabajoDetailPageSidebar]
            Card (PDF + QR etiqueta con id="etiqueta-qr-print" + PrintButton)
            TrabajoDatosCard    (lee CobradoContext + PrioridadContext reactivamente)
            TrabajoClienteSection
            Card (Reglas de estado)
```

### Pattern de external state en TrabajoForm
`TrabajoForm` acepta props opcionales `externalFormAction`, `externalState`, `externalIsPending`. Cuando se proveen, los usa en lugar de llamar a `useActionState` internamente (aunque el hook interno siempre se llama por reglas de React). Esto permite que `TrabajoDetailPage` controle `isPending` para el botón top bar.

### Providers de contexto
| Provider | Context | Toggle | Badge |
|---|---|---|---|
| `CobradoProvider` | `CobradoContext` | `CobradoToggle` | `CobradoBadge` |
| `PrioridadProvider` | `PrioridadContext` | `PrioridadToggle` | `PrioridadBadge` |
| `TrabajosSeleccionProvider` | `TrabajosSeleccionContext` | checkboxes en TrabajoForm | `TrabajosResumen` |
| `RepuestosSeleccionProvider` | `RepuestosSeleccionContext` | inputs en TrabajoForm | resumen en sidebar |

### Trabajos — detalles
- `TrabajoForm` usa `TrabajoItemCard` y `CheckboxBeauti` para los ítems de trabajos y repuestos.
- Los repuestos guardan `precio` y `cantidad` en `trabajo_repuestos`. El catálogo `/repuestos` no define el precio final; ese valor se decide por trabajo.
- El PDF y los listados hidratan marca/modelo/motor desde la base técnica externa.

---

## Componentes UI clave

### Botones
- **`Button`** (`src/components/ui/Button/Button.tsx`) — componente único para todos los botones. Variantes: `primary`, `secondary`, `ghost`, `dark`, `warm`, `burnt`, `outline`, `outline-warm`, `outline-dark`, `outline-ghost`, `danger-ghost`, `link`. Tamaños: `sm`, `md`, `lg`. Props: `icon` (izquierda), `iconRight`, `as="a"` + `href` para renderizar como `<a>`. Exporta también `buttonStyles()` para casos donde solo se necesita la className (ej: sobre `<Link>` de Next.js).
- **No usar `<button>` nativo ni clases hardcodeadas** — siempre usar `<Button>` con la variante correspondiente.
- **Criterio de variantes en tablas/filas editables**: guardar → `PulsatingButton` con estilo borde gris/bg blanco (igual a `saveRowBtnCls` en `shared.tsx`); cancelar → `outline-ghost` con icono X; borrar → `outline-ghost` con icono papelera + `ConfirmDialog`.
- `ButtonGroup<T>` — selector multi-opción (Lista 1/2/3, prioridad en nuevo trabajo). Props: `options`, `value`, `onChange`, `activeTone` por opción.
- **`PulsatingButton`** — usa `Button` internamente, agrega anillo pulsante cuando `pulsing={true}`. Prop `pulseStyle?: "pulse" | "ripple"` (no usar `variant` para el estilo de pulso — conflicta con la variante de Button). Acepta todas las props de `Button`.
- `Incrementor` — ajuste porcentual, usado en `/precios`.

### EstadoStepper
Tres estados con gradientes de color progresivos:
- `pendiente` → "Presupuesto entregado" (gradiente naranja claro)
- `aprobado` → "Presupuesto aceptado" (gradiente naranja oscuro)
- `finalizado` → "Trabajo finalizado" (gradiente verde)

Existe en dos variantes: `EstadoStepper` (form mode, clickeable) y `EstadoStepperDisplay` (read-only).

### Diálogos
- **`Dialog`** (`src/components/ui/Dialog/`) — wrapper sobre `@radix-ui/react-dialog`. `DialogContent` acepta `variant="sheet"` (bottom sheet, mobile) o `variant="centered"` (modal centrado, max-width 420px).
- **`ConfirmDialog`** (`src/components/ui/ConfirmDialog/`) — modal de confirmación centrado. Props: `open`, `onOpenChange`, `title`, `description?`, `confirmLabel`, `cancelLabel`, `onConfirm`, `loading`. Usar siempre en lugar de `window.confirm()`. Para submitear un form oculto tras confirmar: `formRef.current?.requestSubmit()` o `document.getElementById(formId)?.requestSubmit()`.

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
| `src/app/(app)/trabajos/[id]/page.tsx` | Server page del detalle de trabajo; define server actions |
| `src/components/pages/TrabajoDetailPage/TrabajoDetailPage.tsx` | Client component principal, orquesta el estado |
| `src/components/forms/TrabajoForm/TrabajoForm.tsx` | Form de edición (trabajos, vehículo, observaciones) |
| `src/components/forms/ClienteForm/ClienteForm.tsx` | Form de cliente (nuevo y edición) |
| `src/components/forms/DeleteItemForm/DeleteItemForm.tsx` | Botón borrar genérico con `ConfirmDialog` integrado; prop `confirmDescription` opcional |
| `src/components/ui/Button/Button.tsx` | Componente Button + `buttonStyles()` + tipos `ButtonVariant`, `ButtonSize` |
| `src/components/ui/Dialog/Dialog.tsx` | Dialog base (sheet / centered) sobre `@radix-ui/react-dialog` |
| `src/components/ui/ConfirmDialog/ConfirmDialog.tsx` | Modal de confirmación reutilizable |
| `src/components/pages/InformacionTecnicaPage/components/shared.tsx` | Helpers de estilo y componentes compartidos para filas editables (incluye `saveRowBtnCls`, `DeleteButton`) |
| `src/components/pages/RepuestosPage/components/` | Subcomponentes de RepuestosPage: `CategoriaCard`, `SortableRepuestoRow`, `AddRepuestoForm`, `AddCategoriaForm`, `shared.tsx` |
| `src/lib/queries/trabajos.ts` | `getTrabajoDetailById`, `updateTrabajo`, `listTrabajos` |
| `src/lib/queries/catalogo.ts` | `listTrabajosAgrupados`, marcas, modelos, motores |
| `src/lib/qr.ts` | `generateQrSvg(url)` |
| `src/lib/pdf/PresupuestoPdf.tsx` | Componente PDF con `@react-pdf/renderer` |
| `src/app/api/trabajos/[id]/pdf/route.ts` | Route handler PDF (tiene `@ts-expect-error` por React 19 — no tocar) |
| `src/lib/types.ts` | Todos los tipos: `TrabajoEstado`, `TrabajoDetail`, `TrabajoAgrupado`, etc. |
| `src/lib/db.ts` | `queryRows<T>(sql, params)` — cliente PostgreSQL |
| `src/middleware.ts` | Auth JWT con `jose`; roles: `admin`, `superuser`, `operador` |

---

## Base de datos

- ORM: ninguno. SQL directo con `queryRows<T>()`.
- Migraciones en `migrations/` (numeradas). Aplicar con `npm run db:migrate`.
- Tipos enum en PostgreSQL: `trabajo_estado` (`pendiente`, `aprobado`, `finalizado`), `trabajo_prioridad` (`baja`, `normal`, `alta`).
- El valor `entregado` existe en el enum (migración 011) pero no se usa en la UI.
- Migración 014: agrega `precio` y `cantidad` a `trabajo_repuestos`.
- Al agregar estados nuevos: revisar consistencia entre enum DB, labels del stepper y filtros/listados.

### Scripts útiles
```
npm run db:migrate       # aplica migraciones sobre la base principal
npm run db:reset:dev     # borra clientes y trabajos fake marcados como DEV-SEED
npm run db:seed:dev      # crea 15 clientes fake y 15 trabajos fake
```

---

## Notas de desarrollo

- `export const dynamic = "force-dynamic"` en todas las pages que leen datos de la DB.
- Server actions definidas inline en los page files con `"use server"`.
- `redirect()` de Next.js lanza una excepción internamente — no poner dentro de `try/catch`.
- En WSL2 con archivos en Linux FS nativo, el HMR funciona sin `WATCHPACK_POLLING`.
- `src/middleware.ts` (no en raíz) por la estructura con `src/`.
- Variables de entorno en `.env.local`: `DATABASE_URL`, `TECHNICAL_DATABASE_URL`, `NEXT_PUBLIC_BASE_URL`.
