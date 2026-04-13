@AGENTS.md

---

## Feature pendiente: Etiqueta QR por pedido

### Contexto

Queremos poder imprimir una etiqueta con un QR por cada pedido y pegarla físicamente en el bloque (motor) del cliente. Al escanearlo con el celular, el mecánico llega directo a `/pedidos/[id]` en la app. Es de uso **interno** (empleados ya logueados), por lo que no hace falta una ruta pública.

---

### Plan de acción

#### Paso 1 — Instalar dependencia

```bash
npm install qrcode
npm install --save-dev @types/qrcode
```

---

#### Paso 2 — Crear utilidad de QR

**Archivo nuevo:** `src/lib/qr.ts`

Función que recibe una URL y devuelve el SVG del QR como string. Usar `qrcode.toString(url, { type: 'svg' })`. Esta función se llama desde el servidor (Server Component o route handler).

---

#### Paso 3 — Crear la página de etiqueta imprimible

**Archivo nuevo:** `src/app/(app)/pedidos/[id]/etiqueta/page.tsx`

- Server Component (igual que `src/app/(app)/pedidos/[id]/page.tsx`)
- Obtiene datos del pedido con `getPedidoDetailById(id)` (ya existe en `src/lib/queries/pedidos.ts`)
- Genera el SVG del QR con la función del Paso 2
- La URL codificada en el QR: `https://<dominio>/pedidos/[id]`
  - Por ahora hardcodear el dominio o leerlo de una variable de entorno `NEXT_PUBLIC_BASE_URL`
- Renderiza una etiqueta pequeña con:
  - QR code (SVG inline con `dangerouslySetInnerHTML` o como `<img src="data:...">`)
  - Número de pedido (`#numero_pedido`)
  - Nombre del cliente
  - Vehículo y motor
  - Un botón "Imprimir" que llama a `window.print()` (Client Component pequeño)

**Archivo nuevo:** `src/app/(app)/pedidos/[id]/etiqueta/EtiquetaPage.module.scss`

CSS con `@media print` que:
- Oculta todo el layout/nav de la app (usar `display: none` en el wrapper del layout si es necesario)
- Muestra solo la etiqueta centrada
- Define tamaño tipo sticker (ej. 8cm x 6cm)

---

#### Paso 4 — Agregar botón en PedidoDetailPage

**Archivo a modificar:** `src/components/pages/PedidoDetailPage/PedidoDetailPage.tsx`

En el top bar (línea ~95, junto al botón "DESCARGAR PRESUPUESTO"), agregar un `<Link>` o `<a>` a `/pedidos/${pedido.id}/etiqueta` con `target="_blank"`.

Estilo sugerido: similar al botón de PDF pero con color secundario y un icono de etiqueta o QR.

---

#### Paso 5 (opcional) — QR en el PDF

**Archivo a modificar:** `src/lib/pdf/PresupuestoPdf.tsx`

- Generar el QR como SVG string desde el servidor (en `src/app/api/pedidos/[id]/pdf/route.ts`)
- Pasarlo como prop al componente `PresupuestoPdf`
- Renderizarlo en el footer del PDF usando el componente `<Svg>` de `@react-pdf/renderer`
  - Parsear el SVG string y mapearlo a elementos `<Svg>`, `<Path>`, etc. de react-pdf
  - Alternativa más simple: generar el QR como data URL PNG con `qrcode.toDataURL()` y usar `<Image>` de react-pdf

> Nota: hay un `@ts-expect-error` en el route handler del PDF por incompatibilidad de tipos con React 19. No tocar esa línea.

---

### Archivos relevantes (referencia rápida)

| Archivo | Rol |
|---|---|
| `src/lib/pdf/PresupuestoPdf.tsx` | Componente PDF existente |
| `src/app/api/pedidos/[id]/pdf/route.ts` | Route handler que genera el PDF |
| `src/components/pages/PedidoDetailPage/PedidoDetailPage.tsx` | UI de detalle del pedido (línea 95: botón PDF) |
| `src/app/(app)/pedidos/[id]/page.tsx` | Page de detalle (referencia para la nueva page de etiqueta) |
| `src/lib/queries/pedidos.ts` | Query `getPedidoDetailById` |

---

### Orden de implementación recomendado

1. Paso 1 (instalar `qrcode`)
2. Paso 2 (utilidad `src/lib/qr.ts`)
3. Paso 3 (página etiqueta + estilos de impresión)
4. Paso 4 (botón en PedidoDetailPage)
5. Paso 5 (QR en PDF, si se quiere)
