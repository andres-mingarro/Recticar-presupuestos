# Análisis técnico de la aplicación

## 1. Propósito del sistema

Recticar Presupuestos es una aplicación web interna para administrar clientes, trabajos y presupuestos de una rectificadora de motores. No es un portal público ni orientado al cliente final.

Cubre tres necesidades principales:

1. Registrar y consultar clientes.
2. Crear, editar y seguir trabajos.
3. Construir presupuestos combinando mano de obra y repuestos, con salida en PDF y etiqueta QR.

---

## 2. Stack

- Next.js 15 con App Router
- React 19
- TypeScript
- Tailwind CSS v4 + SCSS Modules por componente
- PostgreSQL en Neon, accedido con `@neondatabase/serverless`
- SQL directo, sin ORM
- `@react-pdf/renderer` para PDFs
- `qrcode` para la etiqueta QR
- Font Awesome para iconografía
- `sonner` para toasts de feedback

Dos decisiones de arquitectura impactan en todo el proyecto:

- **Sin ORM.** Toda la persistencia es SQL explícito en `src/lib/queries/`.
- **Dos bases de datos.** La operación comercial y el catálogo técnico pueden vivir separados (ver sección 6).

---

## 3. Estructura del proyecto

```
src/app/(auth)/login              Login
src/app/(app)/                    Rutas protegidas
  clientes/                       Listado, alta, detalle
  trabajos/                       Listado, alta, detalle
  trabajos/[id]/etiqueta          Etiqueta imprimible con QR
  precios/                        Administración de precios y listas
  repuestos/                      Catálogo de repuestos
  configuracion/                  Config de empresa + links a subrutas
  informacion-tecnica/            Catálogo técnico externo
  admin/usuarios/                 Gestión de usuarios

src/components/pages/             Pantallas completas (client components)
src/components/forms/             Formularios complejos y sus contextos
src/components/ui/                Componentes base reutilizables
src/components/layout/            AppShell (shell con topbar, sidebar, main)
src/components/navigation/        MainMenu
src/lib/queries/                  Acceso a base de datos
src/lib/                          Helpers: auth, permisos, formato, QR, PDF
migrations/                       Migraciones SQL versionadas
scripts/                          Herramientas de dev (seed, reset, cleanup)
```

---

## 4. Modelo de ejecución

La app usa el modelo híbrido de App Router:

1. La página servidor (`page.tsx`) carga datos y define server actions.
2. Renderiza un componente cliente con esos datos y las actions inyectadas.
3. El componente cliente maneja interacción, dirty state y UX.
4. Al enviar el formulario, la server action parsea `FormData`, valida y persiste.

Esto se ve con claridad en el detalle de trabajo:

- Página servidor: `src/app/(app)/trabajos/[id]/page.tsx`
- Orquestador cliente: `src/components/pages/TrabajoDetailPage/TrabajoDetailPage.tsx`
- Formulario reutilizable: `src/components/forms/TrabajoForm/TrabajoForm.tsx`

---

## 5. Autenticación y autorización

### Login

El flujo está en `src/app/api/auth/login/route.ts`:

1. El cliente envía `username`, `password` y token de Cloudflare Turnstile.
2. El backend valida Turnstile.
3. Si coincide con el admin de `.env`, genera sesión directamente.
4. Si no, busca el usuario en la base y compara password con bcrypt.
5. Si todo es correcto, emite un JWT y lo guarda en la cookie `recticar_token` (HTTP-only, 30 días).

### Sesión

`src/lib/auth.ts` expone `createToken`, `verifyToken`, `getSession` y `requireSession`.

La sesión contiene: `nombre`, `role`, `sessionId`, `pantallaInicio`.

> No hay campo `email`. El identificador de usuario es `nombre` (el username de login).

### Roles y permisos

Hay dos roles: `super_admin` y `operario`.

- `super_admin` tiene acceso total a todo.
- `operario` tiene permisos configurables por switch, guardados en la tabla `usuario_permisos`.

Permisos disponibles:

| Permiso | Qué habilita |
|---|---|
| `trabajos.ver` | Ver listado y detalle de trabajos |
| `trabajos.crear` | Crear nuevos presupuestos/trabajos |
| `trabajos.editar` | Editar trabajos (también protege `/precios`) |
| `clientes.acceso` | Acceso de solo lectura a clientes |

Los helpers de permisos viven en `src/lib/permisos.ts`.

El usuario `admin` (definido en `.env`) **nunca puede ser eliminado**, ni desde la UI ni desde el servidor.

---

## 6. Bases de datos

`src/lib/db.ts` mantiene dos conexiones:

- `DATABASE_URL` — base principal: clientes, ordenes_trabajo, catálogo de trabajos, repuestos, usuarios.
- `TECHNICAL_DATABASE_URL` — catálogo técnico externo: marcas, modelos, motores, vehículos. Si no está definida, hace fallback a la base principal.

Los trabajos guardan IDs técnicos (`marca_id`, `modelo_id`, `motor_id`) pero no tienen FK locales al catálogo técnico. Eso fue desacoplado en la migración `010_drop_technical_foreign_keys.sql`.

---

## 7. Dominios funcionales

### 7.1 Clientes

Campos: nombre, apellido, teléfono, mail, dirección, ciudad, provincia, CP, DNI, CUIT.

El endpoint `src/app/api/clientes/search/route.ts` alimenta el autocomplete al crear un trabajo.

### 7.2 Trabajos (presupuestos/órdenes)

La tabla principal es `ordenes_trabajo`. Las relaciones viven en:

- `orden_trabajo_trabajos` — ítems de mano de obra
- `orden_trabajo_repuestos` — ítems de repuestos

El identificador visible es `numero_trabajo`.

**Estados:** `presupuesto_entregado → aprobado → finalizado`

El estado inicial de un trabajo nuevo es `presupuesto_entregado`. El valor `pendiente` existe en el enum por compatibilidad histórica pero no se usa en la UI; si aparece en datos viejos, la app lo normaliza como `presupuesto_entregado`.

**Prioridades:** `baja`, `normal`, `alta`.

### 7.3 Catálogo de trabajos (mano de obra)

Los trabajos pertenecen a categorías y tienen cuatro precios: `precio`, `precio_lista_1`, `precio_lista_2`, `precio_lista_3`.

La pantalla `/precios` administra este catálogo con ajuste porcentual masivo por lista.

Cada ítem seleccionado dentro de un presupuesto guarda un **snapshot histórico** de categoría, nombre y precio (migración `020`). Si cambia el catálogo, los presupuestos viejos siguen mostrando el valor guardado. Solo el botón "Actualizar precios" puede refrescar ese snapshot.

### 7.4 Repuestos

El catálogo (`/repuestos`) es una base de nombres y categorías. El precio de un repuesto **no se toma del catálogo** — se define dentro de cada trabajo.

`orden_trabajo_repuestos` guarda: `repuesto_id`, `precio`, `cantidad`, más snapshot de nombre de categoría y nombre de repuesto (migración `021`).

Si un repuesto es borrado del catálogo, el trabajo histórico sigue siendo legible gracias al snapshot y al `ON DELETE SET NULL` en el FK.

A diferencia de los trabajos, el refresco desde catálogo para repuestos solo actualiza nombre/categoría, nunca el precio.

### 7.5 Catálogo técnico (información técnica)

Tablas esperadas en la base técnica: `marcas`, `modelos`, `motores`, `vehiculos`.

La pantalla `/informacion-tecnica` permite ver y editar este catálogo. Solo `super_admin` puede editar; los operarios tienen solo lectura.

Esta ruta vive bajo `/configuracion` a nivel lógico aunque la URL es independiente.

### 7.6 Usuarios

La tabla `usuarios` tiene: `nombre` (PK, es el username), `password_hash`, `password_plain`, `role`, `activo`, `pantalla_inicio`.

La tabla `usuario_permisos` relaciona usuario y permiso.

La gestión está en `/admin/usuarios`, también bajo `/configuracion` a nivel lógico.

---

## 8. Flujo del detalle de trabajo

### Carga inicial

La página servidor carga: el trabajo, los datos técnicos (marcas/modelos/motores), el catálogo de trabajos agrupados, los repuestos agrupados y genera el SVG del QR.

Los nombres técnicos (marca, modelo, motor) no se guardan como texto — se hidratan al vuelo desde los IDs usando `hydrateTechnicalLabels()`.

### Pantalla cliente

`TrabajoDetailPage` orquesta la edición. Envuelve cuatro providers de contexto:

- `PrioridadProvider` / `CobradoProvider` — sincronizan UI antes del submit
- `TrabajosSeleccionProvider` — IDs seleccionados + lista de precios activa
- `RepuestosSeleccionProvider` — selección, precio unitario y cantidad por repuesto

### Formulario

`TrabajoForm` maneja: selección técnica, observaciones, tabs de trabajos/repuestos, dirty state y serialización.

Los ítems seleccionados se serializan como hidden inputs (`trabajosIds`, `repuestosIds`, `repuestoPrecio_<id>`, `repuestoCantidad_<id>`) para usar el submit por `FormData` sin perder la riqueza de la UI cliente.

### Guardado

La server action `updateTrabajoAction` recibe el `FormData`, valida y llama a `updateTrabajo()`, que:

1. Actualiza la fila principal del trabajo.
2. Elimina relaciones que ya no están seleccionadas.
3. Inserta o actualiza las vigentes.
4. Persiste snapshot histórico de nombres y precios.

### Reglas de negocio

- Un trabajo no puede aprobarse sin cliente asignado.
- La fecha de aprobación se guarda solo la primera vez que pasa a `aprobado`.
- `finalizado` mueve el trabajo a historial en UX y listados.
- La alerta de "catálogo cambió" compara solo trabajos; los repuestos no se comparan contra el catálogo vivo.

---

## 9. PDF y etiqueta QR

**PDF:** El endpoint `src/app/api/trabajos/[id]/pdf/route.ts` carga el trabajo con sus snapshots, genera un QR como data URL, renderiza `PresupuestoPdf` con `@react-pdf/renderer` y devuelve el archivo inline. El nombre del archivo incluye número de trabajo y cliente.

**Etiqueta QR:** La página `/trabajos/[id]/etiqueta` se renderiza dentro del `AppShell`. La impresión oculta el shell via CSS en `globals.css` usando `body:has(#etiqueta-qr-print)`. Si cambia la estructura del shell, hay que revisar que la impresión siga siendo correcta.

---

## 10. Limpieza automática de presupuestos

El módulo `src/lib/maintenance/trabajos-cleanup.ts` borra físicamente trabajos en estado `presupuesto_entregado` que tengan `fecha_presupuesto_entregado` vencida y `cobrado = false`.

La configuración vive en `empresa_configuracion`: `auto_eliminar_presupuestos_entregados`, `meses_retencion_presupuesto_entregado`, `ultima_ejecucion_limpieza`.

Se puede ejecutar manualmente desde `/configuracion`. También existe un endpoint cron en `src/app/api/maintenance/trabajos-cleanup/route.ts` protegido con `CRON_SECRET`.

Para probar: `npm run cleanup:test -- --id=39`

---

## 11. Navegación y breadcrumbs

El `AppShell` renderiza automáticamente un breadcrumb en todas las páginas excepto el dashboard.

`/informacion-tecnica` y `/admin/usuarios` tienen jerarquía virtual bajo Configuración, aunque sus URLs son independientes.

---

## 12. Componentes UI propios

El proyecto tiene un sistema de UI propio. Piezas clave:

| Componente | Uso |
|---|---|
| `Button` / `PulsatingButton` | Botones; PulsatingButton indica dirty state |
| `Card`, `PageHeader` | Layout de páginas |
| `EstadoStepper` | Stepper de estado del trabajo (interactivo y display) |
| `CobradoToggle`, `PrioridadToggle` | Toggles con contexto propio |
| `TrabajoItemCard`, `CheckboxBeauti` | Ítems seleccionables en el formulario |
| `Incrementor` | Control (+/-) para ajuste porcentual en `/precios` |
| `Tabs`, `ButtonGroup` | Navegación por pestañas y selección múltiple |
| `Breadcrumb` / `AppBreadcrumb` | Breadcrumbs automáticos en AppShell |
| `ConfirmDialog` | Modal de confirmación — siempre en lugar de `window.confirm()` |
| `Icon` | Todos los íconos pasan por acá, nunca SVG inline |
| `Spinner` | Feedback de carga en botones pending |

Convenciones:

- Cada componente tiene una className raíz con su nombre.
- Los widgets fuera del `<form>` usan `<input type="hidden" form={formId} />`.
- Importes como enteros, sin decimales.

---

## 13. Migraciones

Las migraciones viven en `migrations/` y se aplican con `npm run db:migrate`.

Migraciones más relevantes para entender el estado actual:

| Migración | Qué hace |
|---|---|
| `010` | Desacopla FK del catálogo técnico |
| `016` | Renombra pedidos → ordenes_trabajo |
| `019` | Agrega `fecha_presupuesto_entregado` y config de limpieza |
| `020` | Snapshots históricos de trabajos |
| `021` | Snapshots de repuestos + ON DELETE SET NULL |
| `022` | Roles super_admin/operario + tabla usuario_permisos |
| `023` | Columna `pantalla_inicio` en usuarios |
| `024` | Elimina columna `email` de usuarios; `nombre` pasa a ser PK |

Hay migraciones con números repetidos (`008_*`, `009_*`) — no rompen el runner pero hay que tenerlo en cuenta al revisar el historial.

---

## 14. Scripts de desarrollo

```bash
npm run db:migrate             # Aplica migraciones pendientes
npm run db:reset:dev           # Borra clientes y trabajos marcados DEV-SEED
npm run db:seed:dev            # Crea 15 clientes y 15 trabajos de prueba
npm run cleanup:test -- --id=39  # Prueba limpieza automática sobre un trabajo real
```

---

## 15. Variables de entorno

```
DATABASE_URL                    Base principal (Neon)
TECHNICAL_DATABASE_URL          Catálogo técnico (Neon, opcional)
JWT_SECRET                      Firma JWT
ADMIN_USER / ADMIN_PASSWORD     Credenciales del admin principal (nunca en DB)
NEXT_PUBLIC_BASE_URL            URL base para QR codes
NEXT_PUBLIC_TURNSTILE_SITE_KEY  Cloudflare Turnstile (login)
TURNSTILE_SECRET_KEY            Cloudflare Turnstile (servidor)
CRON_SECRET                     Protege el endpoint de limpieza automática
```

---

## 16. Puntos a vigilar

**Snapshots históricos** — Ningún resumen, PDF o edición debe reconstruir datos desde el catálogo vivo si existe snapshot. Esta regla es fácil de romper al agregar features nuevas.

**Catálogo técnico externo** — Si cambia el esquema de la base técnica o falla la conexión, se rompen formularios de trabajo, PDFs y listados que hidratan marca/modelo/motor.

**Impresión de etiqueta** — La hoja de impresión conoce la estructura del shell. Si cambia el layout, la impresión puede mostrar header o menú.

**`catalogo.ts` mezcla responsabilidades** — Concentra consultas al catálogo técnico externo y al catálogo de trabajos comerciales. Funciona, pero es un archivo a dividir si el proyecto crece.

**Conectividad con Neon** — Un error de red aparece como `fetch failed`. `src/lib/db.ts` distingue base principal vs técnica en el mensaje de error. Ante un error de conexión, revisar variables de entorno y disponibilidad de Neon antes de asumir un bug.
