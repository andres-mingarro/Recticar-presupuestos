# Análisis técnico de la aplicación

## 1. Propósito del sistema

Recticar Presupuestos es una aplicación web para administrar clientes, pedidos y presupuestos de una rectificadora. El sistema cubre tres necesidades principales:

1. Registrar y consultar clientes.
2. Crear, editar y seguir pedidos de trabajo.
3. Construir presupuestos combinando trabajos y repuestos, con salida en PDF y etiqueta QR.

La aplicación está pensada para operación interna. No es un portal público ni un sistema orientado a autoservicio del cliente final.

## 2. Stack y decisiones técnicas

La base tecnológica actual es:

- Next.js 15 con App Router.
- React 19.
- TypeScript.
- Tailwind CSS v4 para utilidades rápidas.
- SCSS Modules para estilos por componente.
- PostgreSQL en Neon, accedido con `@neondatabase/serverless`.
- SQL directo, sin ORM.
- `@react-pdf/renderer` para generar el presupuesto en PDF.
- `qrcode` para generar la etiqueta QR.
- Font Awesome como sistema de iconografía.

Hay dos decisiones de arquitectura que impactan en todo el proyecto:

- No se usa ORM. Toda la lógica de persistencia está escrita como queries SQL en `src/lib/queries`.
- El catálogo técnico no necesariamente vive en la misma base que la operación comercial. La app soporta una base principal y una base técnica separada.

## 3. Estructura general del proyecto

La organización del código sigue una separación bastante clara entre rutas, pantallas, formularios, componentes base y acceso a datos.

### Rutas principales

- `src/app/(auth)/login`: login.
- `src/app/(app)/clientes`: listado, alta y detalle de clientes.
- `src/app/(app)/pedidos`: listado, alta y detalle de pedidos.
- `src/app/(app)/pedidos/[id]/etiqueta`: etiqueta imprimible con QR.
- `src/app/(app)/precios`: administración de trabajos y listas de precios.
- `src/app/(app)/repuestos`: catálogo de repuestos.
- `src/app/(app)/informacion-tecnica`: mantenimiento del catálogo técnico.
- `src/app/(app)/admin/usuarios`: administración de usuarios.

### Capas internas

- `src/components/pages`: componentes de página completos.
- `src/components/forms`: formularios complejos y sus contextos.
- `src/components/ui`: componentes reutilizables.
- `src/lib/queries`: acceso a base de datos.
- `src/lib`: helpers transversales como auth, formato, QR y parsing de formularios.
- `migrations/`: migraciones SQL versionadas.

## 4. Modelo de ejecución: servidor, cliente y formularios

La app usa el modelo híbrido típico de App Router:

- Las páginas (`page.tsx`) suelen ejecutarse en servidor.
- Esas páginas leen datos desde la base.
- Luego delegan la interfaz interactiva a componentes cliente (`"use client"`), sobre todo en formularios y vistas complejas.

Un patrón importante del proyecto es el siguiente:

1. La página servidor carga datos iniciales.
2. Define una o más server actions.
3. Renderiza un componente cliente con esos datos y con la action inyectada.
4. El componente cliente maneja interacción local, selección, dirty state y UX.
5. Al enviar el formulario, la server action parsea el `FormData`, valida y persiste.

Este patrón se ve con claridad en el detalle de pedido:

- La página servidor vive en `src/app/(app)/pedidos/[id]/page.tsx`.
- La pantalla cliente vive en `src/components/pages/PedidoDetailPage/PedidoDetailPage.tsx`.
- El formulario reusable vive en `src/components/forms/PedidoForm/PedidoForm.tsx`.

## 5. Autenticación y autorización

La autenticación está basada en JWT firmado y almacenado en cookie HTTP-only.

### Login

El login se resuelve en `src/app/api/auth/login/route.ts`.

El flujo es:

1. El cliente envía `username`, `password` y token de Cloudflare Turnstile.
2. El backend valida Turnstile.
3. Si coincide con credenciales de admin definidas por variables de entorno, genera sesión admin.
4. Si no, busca el usuario en base y compara password con `bcrypt`.
5. Si todo es correcto, emite un JWT y lo guarda en la cookie `recticar_token`.

### Sesión

La utilidad central es `src/lib/auth.ts`.

Ahí se definen:

- creación del token,
- verificación,
- lectura de sesión para server components y server actions.

La sesión incluye:

- email,
- nombre,
- rol,
- sessionId.

### Control de acceso

El archivo `src/middleware.ts` protege casi toda la aplicación.

Reglas actuales:

- `/login` y `/api/auth/*` son públicas.
- el resto requiere cookie válida,
- el rol `operador` queda bloqueado para:
  - `/clientes/nuevo`
  - `/pedidos/nuevo`
  - `/precios`
  - `/admin`

En la práctica, el middleware implementa un modelo simple de acceso por rol y redirige al listado de pedidos si el usuario no puede entrar.

## 6. Persistencia y bases de datos

La capa de acceso a datos está centralizada en `src/lib/db.ts`.

### Dos conexiones distintas

La app diferencia dos fuentes de datos:

- `DATABASE_URL`: base principal de la aplicación.
- `TECHNICAL_DATABASE_URL`: catálogo técnico externo.

Si `TECHNICAL_DATABASE_URL` no está presente, el código hace fallback a `DATABASE_URL`.

### Helpers de acceso

`src/lib/db.ts` expone cuatro helpers:

- `getSql()`
- `getTechnicalSql()`
- `templateRows() / queryRows()`
- `templateRowsFromTechnical() / queryRowsFromTechnical()`

Esto permite decidir explícitamente si una query pega a la base operativa o a la base técnica.

### Implicancias arquitectónicas

- Clientes, pedidos, trabajos, repuestos, usuarios y relaciones comerciales viven en la base principal.
- Marcas, modelos, motores y combinaciones técnicas se leen desde la base técnica.
- Los pedidos guardan IDs técnicos (`marca_id`, `modelo_id`, `motor_id`) pero ya no dependen de foreign keys locales al catálogo técnico.

Esa desacoplación fue formalizada por la migración `010_drop_technical_foreign_keys.sql`.

## 7. Dominios funcionales principales

### 7.1 Clientes

El dominio clientes cubre alta, búsqueda, detalle y relación con pedidos.

Tipos principales:

- `ClienteListItem`
- `ClienteDetail`

Campos relevantes:

- nombre,
- apellido,
- teléfono,
- mail,
- dirección,
- ciudad,
- provincia,
- código postal,
- DNI,
- CUIT.

Además existe un endpoint de soporte para autocomplete:

- `src/app/api/clientes/search/route.ts`

Ese endpoint devuelve coincidencias por nombre y alimenta el selector de cliente en pedidos.

### 7.2 Pedidos

Es el dominio central del sistema.

Tipos principales en `src/lib/types.ts`:

- `PedidoListItem`
- `PedidoDetail`
- `PedidoFormValues`

Un pedido combina:

- cliente,
- selección técnica,
- número de serie de motor,
- estado,
- prioridad,
- condición de cobro,
- observaciones,
- lista de precios,
- trabajos seleccionados,
- repuestos seleccionados.

Estados hoy vigentes:

- `pendiente`
- `aprobado`
- `finalizado`

Prioridades:

- `baja`
- `normal`
- `alta`

### 7.3 Trabajos

Los trabajos pertenecen a categorías y se usan como ítems de presupuesto.

Cada trabajo guarda varios precios:

- `precio`
- `precio_lista_1`
- `precio_lista_2`
- `precio_lista_3`

La pantalla `/precios` administra este catálogo y permite ajuste porcentual masivo por lista.

La query agrupada principal es `listTrabajosAgrupados()` en `src/lib/queries/catalogo.ts`.

### 7.4 Repuestos

Los repuestos también se organizan por categorías, pero el modelo cambió respecto de versiones anteriores.

Hoy hay que distinguir dos niveles:

1. Catálogo de repuestos.
2. Repuesto dentro de un pedido.

El catálogo (`/repuestos`) hoy funciona esencialmente como una base de nombres y categorías. El precio útil para presupuestar ya no debe salir de ahí.

El precio real se decide dentro de cada pedido.

En consecuencia:

- `pedido_repuestos` guarda `repuesto_id`, `precio` y `cantidad`,
- el total de un repuesto en un pedido es `precio_unitario x cantidad`.

Este cambio quedó formalizado por la migración `014_add_precio_cantidad_to_pedido_repuestos.sql`.

### 7.5 Información técnica

La selección técnica vive conceptualmente fuera del núcleo comercial.

El catálogo técnico esperado contiene:

- `marcas`
- `modelos`
- `motores`
- `vehiculos`

La relación modelo-motor se resuelve desde `vehiculos`.

La capa `src/lib/queries/catalogo.ts` hace dos trabajos distintos:

- leer catálogo técnico externo,
- leer y administrar trabajos comerciales.

Eso conviene tenerlo presente porque el archivo mezcla responsabilidades históricas y de negocio.

### 7.6 Usuarios

Los usuarios internos viven en la base principal y participan del login cuando no se usan credenciales de admin por variables de entorno.

Hay una pantalla administrativa en `/admin/usuarios`.

## 8. Flujo de información del pedido

El pedido es donde más se cruzan servidor, cliente, estado local y persistencia.

### 8.1 Carga inicial del detalle

Cuando se entra a `/pedidos/[id]`, la página servidor:

1. valida el `id`,
2. carga el pedido,
3. carga marcas, modelos, motores y relaciones,
4. carga trabajos agrupados,
5. carga repuestos agrupados,
6. genera el SVG del QR,
7. arma un `initialState` para el formulario.

Esto ocurre en `src/app/(app)/pedidos/[id]/page.tsx`.

### 8.2 Hidratación de nombres técnicos

Los pedidos guardan IDs técnicos, no los nombres.

Para mostrar marca, modelo y motor, la app usa `hydrateTechnicalLabels()` en `src/lib/queries/catalogo.ts`, que:

1. consulta marcas, modelos y motores,
2. arma mapas por ID,
3. agrega `marca_nombre`, `modelo_nombre` y `motor_nombre` a los objetos.

Esto permite mantener persistencia mínima en pedidos y resolver etiquetas al vuelo.

### 8.3 Pantalla cliente del pedido

`PedidoDetailPage` actúa como orquestador visual.

Encapsula varios providers:

- `PrioridadProvider`
- `CobradoProvider`
- `TrabajosSeleccionProvider`
- `RepuestosSeleccionProvider`

La idea es que la UI pueda reaccionar inmediatamente a cambios sin depender de roundtrip al servidor.

### 8.4 Formulario de pedido

`PedidoForm` concentra la mayor parte de la edición.

Responsabilidades principales:

- selección técnica,
- observaciones,
- tabs de trabajos y repuestos,
- serialización de selecciones al submit,
- control de dirty state,
- interoperabilidad con una action externa.

Un detalle importante es que trabajos y repuestos complejos se serializan como hidden inputs. Por ejemplo:

- `trabajosIds`
- `repuestosIds`
- `repuestoPrecio_<id>`
- `repuestoCantidad_<id>`

Eso permite usar controles cliente ricos sin perder la semántica simple del submit por `FormData`.

### 8.5 Selección de trabajos

Los trabajos se manejan con `TrabajosSeleccionProvider`.

Ese contexto guarda:

- IDs seleccionados,
- lista de precios activa.

La lista elegida impacta en el valor mostrado y luego en el cálculo del resumen y del PDF.

### 8.6 Selección de repuestos

Los repuestos se manejan con `RepuestosSeleccionProvider`.

Ese contexto guarda por repuesto:

- selección,
- precio unitario,
- cantidad.

Esto es relevante porque el catálogo no define el precio final presupuestado.

### 8.7 Guardado

Cuando el usuario envía el formulario:

1. la server action `updatePedidoAction` recibe el `FormData`,
2. normaliza strings y valores simples,
3. reconstruye los repuestos con `parsePedidoRepuestos()` desde `src/lib/pedido-repuestos.ts`,
4. valida reglas de negocio,
5. llama a `updatePedido()`.

La función `updatePedido()` en `src/lib/queries/pedidos.ts` hace una estrategia simple y robusta:

1. actualiza la fila principal del pedido,
2. borra `pedido_trabajos`,
3. borra `pedido_repuestos`,
4. reinserta relaciones actuales.

No hay diff fino entre estado viejo y nuevo. El diseño favorece simplicidad y previsibilidad por encima de optimización micro.

### 8.8 Reglas de negocio visibles en código

Hoy existen al menos estas reglas:

- un pedido no puede aprobarse sin cliente asignado,
- la fecha de aprobación se guarda la primera vez que pasa a `aprobado`,
- `finalizado` mueve el pedido a historial a nivel de UX y listados,
- prioridad y cobrado forman parte del mismo flujo de edición.

## 9. Generación de presupuesto PDF

El PDF sale por `src/app/api/pedidos/[id]/pdf/route.ts`.

El flujo es:

1. recibe `id`,
2. carga `PedidoDetail`,
3. carga trabajos ya resueltos para la lista de precios activa,
4. carga repuestos del pedido con precio y cantidad,
5. genera un QR como data URL,
6. renderiza `PresupuestoPdf`,
7. devuelve un PDF inline.

Puntos a notar:

- el nombre del archivo se arma dinámicamente con número de pedido y cliente,
- el PDF usa datos ya cocinados por la capa de queries,
- observaciones ya forman parte del documento,
- los importes hoy se muestran como enteros, sin decimales.

## 10. Etiqueta QR e impresión

La etiqueta QR se ve en `/pedidos/[id]/etiqueta`.

La página se renderiza dentro del `AppShell`, por lo que la impresión requiere ocultar layout global. Ese ajuste está actualmente en:

- `src/app/(app)/pedidos/[id]/etiqueta/EtiquetaPage.module.scss`

Esto es un punto delicado de mantenimiento: si cambia la estructura del shell, la hoja de impresión puede volver a mostrar header o menú lateral.

## 11. Convenciones de interfaz y componentes reutilizables

El proyecto fue consolidando un pequeño sistema de UI propio.

Piezas relevantes:

- `Button`
- `Card`
- `Badge`
- `Table`
- `PageHeader`
- `PulsatingButton`
- `Tabs`
- `ButtonGroup`
- `Incrementor`
- `CheckboxBeauti`
- `PedidoItemCard`
- `EstadoStepper`
- `PrioridadToggle`
- `CobradoToggle`
- `Icon`

Convenciones actuales importantes:

- cada componente debe tener una clase raíz identificable,
- se prefiere usar componentes base antes que recrear estilos ad hoc,
- los íconos deben pasar por `src/components/ui/Icon`,
- el detalle del pedido usa un único botón de guardado,
- cuando un widget vive fuera del `<form>`, sus datos se envían mediante hidden inputs asociados por `form={formId}`.

## 12. Formato de dinero y reglas de importes

La aplicación trabaja hoy con importes enteros.

Esto afecta:

- visualización en formularios,
- resúmenes,
- PDF,
- precios de trabajos,
- precio unitario de repuestos por pedido.

La normalización de formato está centralizada en `src/lib/format.ts`.

## 13. API interna y endpoints auxiliares

Además del login y el PDF, existen endpoints de soporte:

- `/api/clientes/search`: autocomplete de clientes.
- `/api/georef/provincias`
- `/api/georef/localidades`
- `/api/auth/logout`

En general no exponen una API pública de negocio. Son endpoints de apoyo a la interfaz.

## 14. Migraciones y evolución del esquema

Las migraciones viven en `migrations/` y se ejecutan con:

```bash
npm run db:migrate
```

El proyecto muestra una evolución bastante clara:

- esquema base de clientes y pedidos,
- ampliaciones de datos de cliente,
- incorporación de precios por trabajo,
- incorporación de usuarios,
- listas de precios,
- desacople del catálogo técnico,
- incorporación de repuestos,
- precio y cantidad por repuesto dentro del pedido.

Una observación útil: hay versiones repetidas en nombres de migración como `008_*` y `009_*`. Eso no necesariamente rompe el runner, pero sí exige disciplina al revisar historial y orden de aplicación.

## 15. Puntos fuertes de la arquitectura actual

- Separación razonable entre rutas, pantallas, componentes y queries.
- SQL explícito y fácil de rastrear.
- Buen uso del modelo híbrido servidor/cliente de App Router.
- Formulario de pedido suficientemente flexible para una UI rica.
- Desacople correcto entre catálogo técnico y operación comercial.
- Evolución acertada de repuestos hacia un precio por pedido, que refleja mejor la realidad del negocio.

## 16. Riesgos técnicos y puntos a vigilar

### Mezcla de responsabilidades en algunos archivos

`src/lib/queries/catalogo.ts` concentra catálogo técnico y trabajos comerciales. Funciona, pero complica la lectura y hace más difícil separar contextos de negocio.

### Estrategia de reescritura total en relaciones del pedido

Borrar y reinsertar `pedido_trabajos` y `pedido_repuestos` es simple, pero puede volverse costoso o incómodo si mañana se agregan auditorías, trazabilidad fina o edición concurrente.

### Dependencia estructural del AppShell para impresión

La impresión de etiquetas depende de selectores que conocen la estructura del shell. Si cambia el layout, la impresión puede degradarse sin tocar código de QR.

### Persistencia histórica de precios

El cambio de repuestos fue correcto, pero todavía conviene vigilar que ninguna pantalla vuelva a tomar el precio del catálogo como si fuera precio presupuestado.

### Base técnica externa

La disponibilidad y forma del catálogo técnico son críticas. Si cambia el esquema externo o la conectividad, se impactan formularios de pedido, PDFs y listados que hidratan etiquetas técnicas.

## 17. Archivos clave para mantenimiento

Si alguien nuevo entra al proyecto, estos archivos son los mejores puntos de arranque:

- `README.md`: stack, variables y scripts.
- `src/lib/db.ts`: estrategia de conexión a bases.
- `src/middleware.ts`: seguridad y autorización.
- `src/lib/auth.ts`: sesión y JWT.
- `src/lib/types.ts`: modelo tipado compartido.
- `src/lib/queries/pedidos.ts`: núcleo del negocio de pedidos.
- `src/lib/queries/catalogo.ts`: trabajos y catálogo técnico.
- `src/lib/queries/repuestos.ts`: catálogo y detalle de repuestos por pedido.
- `src/app/(app)/pedidos/[id]/page.tsx`: ensamblado servidor del detalle.
- `src/components/pages/PedidoDetailPage/PedidoDetailPage.tsx`: orquestación cliente del detalle.
- `src/components/forms/PedidoForm/PedidoForm.tsx`: formulario principal.
- `src/app/api/pedidos/[id]/pdf/route.ts`: salida PDF.

## 18. Conclusión

La aplicación tiene una arquitectura pragmática y bastante alineada con su problema de negocio. No intenta abstraer de más: usa SQL directo, formularios claros, server actions y componentes cliente donde realmente hacen falta.

El centro del sistema es el pedido. Todo lo demás orbita alrededor de esa entidad:

- clientes para identificar al dueño del trabajo,
- catálogo técnico para describir el vehículo o motor,
- trabajos para presupuestar mano de obra,
- repuestos para presupuestar materiales con precio variable por caso,
- PDF y QR para materializar el pedido fuera de la pantalla.

Desde el punto de vista técnico, la base es sólida para seguir creciendo. Los próximos cuidados deberían enfocarse en mantener clara la separación de responsabilidades, proteger el flujo del pedido y evitar que el crecimiento de la UI termine duplicando reglas de negocio en demasiados lugares.
