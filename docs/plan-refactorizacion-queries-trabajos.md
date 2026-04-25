# Plan: Refactorización queries de trabajos + fix estadísticas

## Contexto

Al agregar `precio_stock` y `cantidad_stock` a `orden_trabajo_repuestos`, se introdujo un bug en `updateTrabajo`: la query usa SQL crudo con parámetros posicionales (`$1`, `$2`...) contados a mano. Agregar parámetros en el medio desincronizó los índices y rompió el guardado de trabajos.

Se detectaron además dos issues de alcance más amplio.

---

## Issues

### 1. Bug activo — `estadisticas.ts`

**Archivo:** `src/lib/queries/estadisticas.ts`

Las queries `getCobradosMensuales` y `getResumenAnual` calculan el total de repuestos como:

```sql
SUM(precio * cantidad)
```

Con el nuevo esquema de stock esto es incorrecto. El total real es:

```sql
precio_stock * cantidad_stock + precio * (cantidad - cantidad_stock)
```

Impacta los números que se muestran en la pantalla de Estadísticas.

**Fix:** reemplazar la subquery de repuestos en ambas funciones.

---

### 2. Deuda técnica — `updateTrabajo`

**Archivo:** `src/lib/queries/trabajos.ts`

`updateTrabajo` usa una CTE monolítica con 27 parámetros posicionales. Cualquier agregado en el medio rompe todos los índices siguientes.

**Solución:** romper en queries separadas con `templateRows`, igual a como ya funciona `createTrabajo`.

Estructura nueva:

```
1. UPDATE ordenes_trabajo           (templateRows — scalars, sin arrays)
2. DELETE orden_trabajo_trabajos    (templateRows — WHERE NOT IN)
3. DELETE orden_trabajo_repuestos   (templateRows — WHERE NOT IN)
4. INSERT orden_trabajo_trabajos    (queryRows separado, ≤6 params)
5. INSERT orden_trabajo_repuestos   (queryRows separado, ≤8 params)
```

Cada query hace una sola cosa y tiene máximo 8 parámetros. Agregar una columna = agregar una línea al template, sin contar $N.

---

## Alcance

| Qué | Impacto |
|---|---|
| `estadisticas.ts` | Bug activo en totales de estadísticas |
| `updateTrabajo` en `trabajos.ts` | Refactor interno, firma de función no cambia |
| `createTrabajo` | No se toca — ya usa queries separadas |
| `trabajos-cleanup.ts` | No se toca — solo DELETEs en cascada |
| Callers (`page.tsx`) | No se tocan — firma externa no cambia |
| Migraciones | No se tocan — ya aplicadas |
| Scripts DB | No se tocan |

---

## Prioridades

| # | Qué | Urgencia |
|---|---|---|
| 1 | Fix `estadisticas.ts` | Bug activo |
| 2 | Refactorizar `updateTrabajo` | Deuda técnica |
