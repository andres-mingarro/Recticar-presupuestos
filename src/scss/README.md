# scss/

Estilos globales del proyecto. Los estilos por componente van en su propio `*.module.scss` dentro de la carpeta del componente.

---

## globals.scss

Importado en `src/app/layout.tsx`. Contiene variables CSS, tipografía, reset y reglas de impresión.

---

## Breakpoints

El proyecto usa Tailwind CSS v4. Los breakpoints son los estándar de Tailwind:

| Prefijo Tailwind | `min-width` | Alias         |
|------------------|-------------|---------------|
| (default)        | —           | mobile        |
| `sm:`            | `640px`     |               |
| `md:`            | `768px`     |               |
| `lg:`            | `1024px`    | desktop       |
| `xl:`            | `1280px`    |               |
| `2xl:`           | `1536px`    |               |

En Tailwind usás los prefijos directamente en el HTML/JSX:

```tsx
<div className="text-sm lg:text-base">...</div>
```

En los `.module.scss` de componentes usás el valor del breakpoint:

```scss
// mobile (default)
.MiComponente {
  font-size: 1rem;
}

// desktop (lg en Tailwind)
@media (min-width: 1024px) {
  .MiComponente {
    font-size: 1.125rem;
  }
}
```

Las variables CSS de tipografía en `globals.scss` también se ajustan en `lg` (1024px).

---

## Variables CSS disponibles

### Tipografía (se ajustan automáticamente por breakpoint)

| Variable                | Mobile       | Desktop      |
|-------------------------|--------------|--------------|
| `--font-size-xs`        | `0.75rem`    | `0.875rem`   |
| `--font-size-sm`        | `0.875rem`   | `1rem`       |
| `--font-size-base`      | `1rem`       | `1.125rem`   |
| `--font-size-lg`        | `1.125rem`   | `1.25rem`    |
| `--font-size-xl`        | `1.25rem`    | `1.5rem`     |
| `--font-size-2xl`       | `1.5rem`     | `1.875rem`   |
| `--font-size-3xl`       | `1.875rem`   | `2.25rem`    |
| `--font-size-4xl`       | `2.25rem`    | `3rem`       |

Clases utilitarias disponibles: `.text-xs`, `.text-sm`, `.text-base`, `.text-lg`, `.text-xl`, `.text-2xl`, `.text-3xl`, `.text-4xl`

### Colores base

| Variable                    | Valor                        | Uso                        |
|-----------------------------|------------------------------|----------------------------|
| `--color-background`        | `#f6f7fb`                    | Fondo de la app            |
| `--color-foreground`        | `#111827`                    | Texto principal            |
| `--color-foreground-muted`  | `#475569`                    | Texto secundario           |
| `--color-foreground-subtle` | `#64748b`                    | Texto terciario/placeholders |
| `--color-surface`           | `#f8fafc`                    | Superficie de cards        |
| `--color-surface-alt`       | `#eef2f7`                    | Superficie alternativa     |
| `--color-border`            | `rgba(148,163,184,0.26)`     | Bordes generales           |
| `--color-accent`            | `#ea580c`                    | Naranja principal          |
| `--color-accent-strong`     | `#c2410c`                    | Naranja oscuro (hover)     |
| `--color-accent-soft`       | `rgba(251,146,60,0.2)`       | Naranja suave (fondos)     |

### Sombras

| Variable              | Uso                        |
|-----------------------|----------------------------|
| `--color-shadow-sm`   | Sombra sutil               |
| `--color-shadow-md`   | Sombra media (cards)       |
| `--color-shadow-lg`   | Sombra pronunciada         |
| `--color-shadow-xl`   | Sombra fuerte (modales)    |
| `--color-overlay`     | Overlay oscuro (modales)   |

### Estados semánticos

| Prefijo              | Variables disponibles                                      |
|----------------------|------------------------------------------------------------|
| `--color-success-*`  | `bg`, `bg-strong`, `border`, `border-strong`, `fill`, `text`, `text-strong` |
| `--color-danger-*`   | `bg`, `bg-strong`, `border`, `text`                        |
| `--color-info-*`     | `bg`, `bg-strong`, `border`, `border-strong`, `text`, `text-strong` |
| `--color-warning-*`  | `bg`, `border`, `text`                                     |
| `--color-neutral-*`  | `bg`, `border`, `border-strong`, `text`, `text-strong`     |
| `--color-violet-*`   | `bg`, `border`, `text`                                     |

### Sidebar

Variables con prefijo `--color-sidebar-*`: `text`, `text-strong`, `surface`, `surface-hover`, `border`, `border-strong`, `gradient-start`, `gradient-end`, `accent-glow`, `highlight`.

### Prioridad

| Variable                        | Alias de                              |
|---------------------------------|---------------------------------------|
| `--color-priority-low-*`        | neutral                               |
| `--color-priority-normal-*`     | info                                  |
| `--color-priority-high-*`       | danger                                |
