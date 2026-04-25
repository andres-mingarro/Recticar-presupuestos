# Criterios y flujo de datos — guía para agentes y desarrolladores

Este documento describe los patrones obligatorios para manejar datos en este proyecto. Su objetivo es que cualquier cambio futuro —hecho por un humano o una IA— sea consistente con lo ya establecido y no mezcle enfoques distintos.

---

## 1. De dónde vienen los datos

**Regla:** los datos de la DB llegan al cliente en una sola dirección: **Server Component → props → Client Component**. Los Client Components no fetchean datos directamente.

```
DB
 └─ queryRows()          ← en un Server Component o en lib/queries/
     └─ datos como props
         └─ Client Component (solo lee props, no llama a la DB)
```

**Correcto:**
```tsx
// page.tsx (Server Component)
export default async function Page() {
  const trabajos = await listTrabajos();     // ← DB aquí
  return <TrabajosPage trabajos={trabajos} />;
}

// TrabajosPage.tsx ("use client")
export function TrabajosPage({ trabajos }: { trabajos: TrabajoListItem[] }) {
  // usa trabajos directamente, no hace fetch
}
```

**Incorrecto:**
```tsx
// NUNCA hacer esto en un Client Component
useEffect(() => {
  fetch("/api/trabajos").then(...);  // ← rompe el patrón
}, []);
```

---

## 2. Cómo se escriben los datos (Server Actions)

**Regla:** toda modificación de DB se hace con una **server action** definida inline en el `page.tsx` correspondiente, marcada con `"use server"`. Siempre envuelta en `try/catch`. Siempre retorna `{ error: string | null, values }`.

```tsx
// src/app/(app)/trabajos/[id]/page.tsx
async function updateTrabajoAction(
  _prev: TrabajoFormState,
  formData: FormData
): Promise<TrabajoFormState> {
  "use server";

  const values = parseFormData(formData);  // parsing FUERA del try

  if (values.estado === "aprobado" && !values.clienteId) {
    return { error: "Requiere cliente.", values };  // validación FUERA del try
  }

  try {
    await updateTrabajo(trabajoId, values);          // DB DENTRO del try
    revalidatePath(`/trabajos/${trabajoId}`);
    return { error: null, values };
  } catch {
    return { error: "No se pudieron guardar los cambios.", values };
  }
}
```

**Reglas específicas:**
- El parsing de `FormData` y las validaciones de negocio van **fuera** del `try/catch`.
- Solo la llamada a la DB y el `revalidatePath` van **dentro** del `try/catch`.
- `redirect()` **nunca** dentro de `try/catch` — lanza una excepción internamente en Next.js.
- Las actions de módulos distintos (trabajos, repuestos, precios) siguen el mismo contrato de retorno.

---

## 3. Cómo fluye el estado de un formulario

**Regla:** `useActionState` se llama **una sola vez**, en el componente padre que necesita acceso a `isPending`. Los resultados (`formAction`, `state`, `isPending`) se pasan hacia abajo como props directas. El hijo **nunca** vuelve a llamar `useActionState` para la misma acción.

```
TrabajoDetailPage
  const [formState, formAction, isPending] = useActionState(action, initialState)
  │
  ├─ PulsatingButton disabled={isPending}  ← usa isPending del padre
  │
  └─ TrabajoForm
       props: { formAction, state: formState, isPending }
       // NO llama useActionState internamente
```

**Incorrecto (patrón eliminado):**
```tsx
// TrabajoForm — NUNCA hacer esto
const [internalState, internalAction, internalPending] = useActionState(action, initialState);
const state = externalState ?? internalState;   // ← duplicación del hook
```

**Correcto:**
```tsx
// TrabajoForm — recibe todo del padre
export function TrabajoForm({ formAction, state, isPending }: TrabajoFormProps) {
  // usa directamente formAction, state, isPending
}
```

---

## 4. Cómo se comparte estado entre componentes

**Regla:** el estado compartido entre componentes hermanos o nietos se maneja con **Context + Provider**. Todos los hooks de contexto **lanzan un error** si se usan fuera del árbol del Provider — no hay fallbacks silenciosos (noop).

```tsx
// Correcto: lanza error claro
export function useTrabajosSeleccion(): TrabajosSeleccionContextValue {
  const ctx = useContext(TrabajosSeleccionContext);
  if (!ctx) throw new Error("useTrabajosSeleccion must be used inside TrabajosSeleccionProvider");
  return ctx;
}

// Incorrecto: falla silenciosamente, oculta bugs
export function useTrabajosSeleccion() {
  return useContext(TrabajosSeleccionContext) ?? { selectedIds: new Set(), toggle: () => {} };
}
```

**Providers existentes y su scope:**

| Provider | Qué comparte | Dónde vive |
|---|---|---|
| `CobradoProvider` | estado cobrado/no cobrado | Wrappea `TrabajoDetailPage` |
| `PrioridadProvider` | prioridad del trabajo | Wrappea `TrabajoDetailPage` |
| `IvaProvider` | si aplica IVA | Wrappea form de nuevo y edición |
| `TrabajosSeleccionProvider` | IDs de trabajos seleccionados + lista de precios | Dentro de `TrabajoDetailPage` y `NuevoTrabajoPage` |
| `RepuestosSeleccionProvider` | repuestos seleccionados con precios y cantidades | Wrappea los forms |

**Regla de estado local vs context:** si el estado lo necesita solo el componente actual o un hijo directo, es `useState`. Si lo necesitan componentes en distintas ramas del árbol, es Context.

---

## 5. Cómo se accede a la DB

**Regla:** toda query va a través de `queryRows<T>(sql, params)` o `templateRows<T>` definidos en `src/lib/db.ts`. Las queries reutilizables viven en `src/lib/queries/`. No se duplica lógica SQL entre archivos.

```tsx
// src/lib/queries/trabajos.ts
export async function getTrabajoDetailById(id: number): Promise<TrabajoDetail | null> {
  const rows = await queryRows<{ ... }>(`SELECT ... FROM ordenes_trabajo WHERE id = $1`, [id]);
  return rows[0] ?? null;
}
```

**Reglas específicas:**
- Si una expresión SQL se usa en más de un archivo, se extrae a un helper en `db.ts` o `queries/`. Ejemplo: `precioListaColName(lista: 1 | 2 | 3)` en `src/lib/db.ts`.
- Nunca hardcodear strings de columnas SQL en más de un lugar.
- La normalización de datos legacy (como `pendiente` → `presupuesto_entregado`) se hace **en la capa de query**, no en los componentes.

```tsx
// src/lib/queries/trabajos.ts — normalización en la capa correcta
function normalizeLegacyTrabajoEstado<T extends { estado: TrabajoEstado }>(row: T): T {
  if (row.estado !== "pendiente") return row;
  return { ...row, estado: "presupuesto_entregado" };
}

export async function listTrabajosByCliente(clienteId: number) {
  const rows = await queryRows<...>(`...`);
  return rows.map(normalizeLegacyTrabajoEstado);  // ← normalización aquí
}
```

---

## 6. Tipos

**Regla:** todos los tipos del dominio viven en `src/lib/types.ts`. No se definen tipos de dominio en los componentes ni en los archivos de queries. Los tipos de estado de formulario (`TrabajoFormState`, `ClienteFormState`) viven junto al componente de formulario que los usa.

**Correcto:**
```tsx
// src/lib/types.ts
export type TrabajoListItem = { id: number; estado: TrabajoEstado; ... };

// src/components/forms/TrabajoForm/TrabajoForm.tsx
export type TrabajoFormState = { error: string | null; values: TrabajoFormValues };
```

**Incorrecto:**
```tsx
// NUNCA redefinir tipos de dominio en un componente
type MiTrabajo = { id: number; estado: string; ... };  // ← duplicado
```

---

## 7. Valores monetarios y porcentuales

**Regla:** los importes en pesos se persisten y muestran como **enteros** — sin decimales, sin centavos. Siempre `Math.round()` antes de guardar o mostrar.

**Regla para ajustes porcentuales (ej: Incrementor en /precios):**
- El porcentaje acumulado se aplica siempre sobre el **precio original de la DB**, no sobre el valor ya ajustado del paso anterior. Esto evita el efecto de redondeo compuesto que bloquea valores pequeños.
- La granularidad del incremento es **0.1% por click**.
- El acumulado se redondea a 1 decimal para evitar errores de punto flotante (`Math.round(total * 10) / 10`).

```tsx
// Correcto
function applyAdjustment(lista: 1 | 2 | 3, delta: number) {
  const newTotal = Math.round((ajustesPorcentaje[lista] + delta) * 10) / 10;
  const factor = 1 + newTotal / 100;

  setPrecioDrafts((prev) => {
    for (const trabajo of grupo.trabajos) {
      // ← usa trabajo.precioLista1 (original de DB), no el draft redondeado
      next[trabajo.id].precioLista1 = Math.round(trabajo.precioLista1 * factor);
    }
  });
}

// Incorrecto — efecto trampa de redondeo
function applyAdjustment(lista: 1 | 2 | 3, delta: number) {
  const factor = 1 + delta / 100;
  // ← usa current.precioLista1 (draft ya redondeado): 10 * 1.01 = 10.1 → 10 → atascado
  next[id].precioLista1 = Math.round(current.precioLista1 * factor);
}
```

---

## 8. Estados legacy en la DB

**Regla:** si existe un valor de enum en PostgreSQL que fue reemplazado por otro, la normalización se hace **una vez en la capa de query** y el resto de la app no lo conoce.

Caso concreto: el estado `pendiente` en `trabajo_estado` fue reemplazado por `presupuesto_entregado`. La función `normalizeLegacyTrabajoEstado` en `src/lib/queries/trabajos.ts` hace la conversión. Ningún componente ni filtro de la UI debe comparar contra `"pendiente"` como si fuera un valor válido activo. El tipo `TrabajoEstado` incluye `"pendiente"` marcado como `@deprecated` solo para que TypeScript no falle al leer registros viejos.

---

## 9. Checklist antes de hacer un cambio

Antes de tocar cualquier archivo de datos o estado, responder estas preguntas:

1. **¿Estoy duplicando una query?** → extraer a `src/lib/queries/` o a un helper en `db.ts`.
2. **¿Estoy llamando `useActionState` en un hijo cuando el padre ya lo llama?** → pasar los resultados como props en su lugar.
3. **¿Estoy comparando contra un valor de enum legacy?** → chequear si ya hay una función de normalización.
4. **¿Estoy definiendo un tipo de dominio fuera de `src/lib/types.ts`?** → moverlo.
5. **¿Mi server action no tiene `try/catch`?** → agregarlo.
6. **¿Mi hook de contexto retorna un noop si no hay Provider?** → cambiar a `throw new Error(...)`.
7. **¿Estoy aplicando un porcentaje sobre un valor ya redondeado en un loop?** → aplicar sobre el original.
