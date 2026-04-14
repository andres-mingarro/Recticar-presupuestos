@AGENTS.md

---

## Estado actual del proyecto

App interna para gestión de pedidos de rectificación de motores. Empleados logueados (no clientes). Stack: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4, PostgreSQL.

---

## Convenciones obligatorias

### Componentes
- **Todo componente tiene su nombre como className** en el elemento raíz. Ej: `<div className="CobradoToggle flex-1">`.
- Los archivos de componentes viven en `src/components/` organizados por tipo (`ui/`, `forms/`, `pages/`, `layout/`, `navigation/`, `search/`, `pagination/`, `sortable/`).

### Formularios y guardado
- **Los cambios siempre se guardan con un único botón "Guardar"**. No hay auto-save ni acciones individuales por widget dentro del detalle de pedido.
- Los widgets fuera del `<form>` (toggles de cobrado, prioridad, estado) usan `<input type="hidden" name="..." form={formId} />` para enviar su valor al formulario correcto.
- `useActionState` se levanta al componente padre cuando el padre necesita acceso a `isPending` (ej: `PedidoDetailPage`).

### Feedback visual
- **`Spinner`** (`src/components/ui/Spinner.tsx`): SVG `animate-spin`, se usa en todos los botones de guardar mientras `isPending`.
- **`PulsatingButton`** (`src/components/ui/PulsatingButton.tsx`): botón que pulsa via `box-shadow` animado cuando `pulsing={true}`. Se usa para indicar cambios sin guardar (`dirty && !isPending`). Props: `pulsing`, `variant` (`"pulse"` | `"ripple"`), `distance`, `duration`, `pulseColor`.
- El estado `dirty` se activa con `onClickCapture` en toggles y `onInput` en el form. Se resetea con `useEffect` cuando `isPending` pasa a `true`.

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
            Card (PDF + QR etiqueta + PrintButton)
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

---

## Componentes UI clave

### Botones
- `Button` / `buttonStyles()` — variantes: `primary` (naranja gradient), `secondary`, `ghost`, `dark` (slate gradient).
- `ButtonGroup<T>` — selector multi-opción (Lista 1/2/3, prioridad en nuevo pedido). Props: `options`, `value`, `onChange`, `activeTone` por opción.
- `PulsatingButton` — extiende `buttonStyles`, agrega anillo pulsante.

### EstadoStepper
Tres estados con gradientes de color progresivos:
- `pendiente` → "Presupuesto entregado" (gradiente naranja claro)
- `aprobado` → "Presupuesto aceptado" (gradiente naranja oscuro)
- `finalizado` → "Pedido finalizado" (gradiente verde)

Existe en dos variantes: `EstadoStepper` (form mode, clickeable) y `EstadoStepperDisplay` (read-only).

### Badges
`StatusBadge`, `PriorityBadge`, `PaymentBadge`, `ContactBadge`, `BusinessDaysBadge` en `src/components/ui/Badge/Badge.tsx`.

### Etiqueta QR
El QR se genera server-side con `generateQrSvg()` (`src/lib/qr.ts`, usa el paquete `qrcode`). Se muestra inline en el sidebar del detalle de pedido. El botón `PrintButton` llama a `window.print()` y el CSS de impresión en `PedidoDetailPage.module.scss` oculta todo excepto la etiqueta.

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
- Migraciones en `migrations/` (numeradas, aplicar manualmente con `psql`).
- Tipos enum en PostgreSQL: `pedido_estado` (`pendiente`, `aprobado`, `finalizado`), `pedido_prioridad` (`baja`, `normal`, `alta`).
- El valor `entregado` existe en el enum de la DB (migración 011) pero no se usa en la UI.

---

## Notas de desarrollo

- `export const dynamic = "force-dynamic"` en todas las pages que leen datos de la DB.
- Server actions definidas inline en los page files con `"use server"`.
- `redirect()` de Next.js lanza una excepción internamente — no poner dentro de `try/catch`.
- En WSL2 con archivos en Linux FS nativo, el HMR funciona sin `WATCHPACK_POLLING`.
- `src/middleware.ts` (no en raíz) por la estructura con `src/`.
