/**
 * Fuente de verdad de los themes de color.
 *
 * Un theme es solo la escala de marca: 8 valores. Todo el resto del color
 * (acentos, bordes, gradientes de botones) se deriva de esos 8 en
 * `src/scss/globals.css`, así que agregar un theme nuevo no toca componentes.
 *
 * La escala se nombra por rol, no por color: `--brand-500` sigue siendo
 * `--brand-500` en un theme azul. Los nombres viejos (`--orange-vivid`,
 * `--brown-burnt`, etc.) quedan como alias legacy en globals.css y se van
 * migrando de a poco.
 *
 * IMPORTANTE: este archivo y el bloque de themes de `globals.css` tienen que
 * mantenerse en sincronía. La duplicación es a propósito: los PDF usan
 * `@react-pdf/renderer`, que no lee variables CSS y necesita valores JS.
 */

/** Tonos de la escala de marca, de más claro a más oscuro. */
export const BRAND_TONES = [50, 200, 300, 400, 500, 600, 700, 900] as const;

export type BrandTone = (typeof BRAND_TONES)[number];

/** Los 8 colores que definen un theme. */
export type BrandScale = Record<BrandTone, string>;

export type ThemeId = "orange" | "blue" | "green" | "violet";

export type Theme = {
  id: ThemeId;
  /** Nombre visible: solo aparece con el selector abierto. */
  label: string;
  scale: BrandScale;
  /** Los dos tonos que representan al theme en el círculo del selector. */
  swatch: [BrandTone, BrandTone];
};

export const THEMES: Record<ThemeId, Theme> = {
  orange: {
    id: "orange",
    label: "Naranja",
    swatch: [500, 900],
    scale: {
      50: "#fff0e1",
      200: "#ffd1b3",
      300: "#ffc985",
      400: "#fb923c",
      500: "#ff7518",
      600: "#ea580c",
      700: "#c2410c",
      900: "#803600",
    },
  },
  blue: {
    id: "blue",
    label: "Azul",
    swatch: [500, 900],
    scale: {
      50: "#eff6ff",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      900: "#1e3a8a",
    },
  },
  green: {
    id: "green",
    label: "Verde",
    swatch: [500, 900],
    scale: {
      50: "#ecfdf5",
      200: "#a7f3d0",
      300: "#6ee7b7",
      400: "#34d399",
      500: "#10b981",
      600: "#047857",
      700: "#065f46",
      900: "#064e3b",
    },
  },
  violet: {
    id: "violet",
    label: "Violeta",
    swatch: [500, 900],
    scale: {
      50: "#f5f3ff",
      200: "#ddd6fe",
      300: "#c4b5fd",
      400: "#a78bfa",
      500: "#8b5cf6",
      600: "#7c3aed",
      700: "#6d28d9",
      900: "#4c1d95",
    },
  },
};

export const DEFAULT_THEME_ID: ThemeId = "orange";

/** El theme se guarda por dispositivo, no en la DB. */
export const THEME_COOKIE = "theme";

const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * El modo es un eje independiente del theme: cualquier paleta funciona en
 * claro y en oscuro. `"system"` sigue la preferencia del sistema operativo y
 * es el default — en ese caso no se escribe `data-mode` y resuelve el CSS con
 * `prefers-color-scheme`, sin JS y sin parpadeo.
 */
export type ThemeMode = "light" | "dark" | "system";

export const MODE_COOKIE = "theme-mode";

export const DEFAULT_MODE: ThemeMode = "system";

export const MODE_IDS: ThemeMode[] = ["light", "dark", "system"];

export const MODE_LABELS: Record<ThemeMode, string> = {
  light: "Claro",
  dark: "Oscuro",
  system: "Sistema",
};

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

export function resolveThemeMode(value: unknown): ThemeMode {
  return isThemeMode(value) ? value : DEFAULT_MODE;
}

export const THEME_IDS = Object.keys(THEMES) as ThemeId[];

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && value in THEMES;
}

/** Normaliza un valor de origen desconocido (DB, form, cookie) a un theme válido. */
export function resolveThemeId(value: unknown): ThemeId {
  return isThemeId(value) ? value : DEFAULT_THEME_ID;
}

export function getTheme(id: unknown): Theme {
  return THEMES[resolveThemeId(id)];
}

/**
 * Color de marca como string, para contextos que no leen variables CSS.
 * Pensado para los PDF (`@react-pdf/renderer`).
 */
export function brandColor(id: unknown, tone: BrandTone): string {
  return getTheme(id).scale[tone];
}

/** Los dos colores del círculo del selector, ya resueltos a hex. */
export function themeSwatch(id: unknown): [string, string] {
  const { scale, swatch } = getTheme(id);
  return [scale[swatch[0]], scale[swatch[1]]];
}

/**
 * Aplica el theme en el browser: instantáneo, sin recargar y sin round-trip.
 * La cookie solo existe para que el server lo pinte bien en la próxima carga.
 */
export function applyTheme(id: unknown): ThemeId {
  const themeId = resolveThemeId(id);
  document.documentElement.dataset.theme = themeId;
  document.cookie = `${THEME_COOKIE}=${themeId}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; samesite=lax`;
  return themeId;
}

/**
 * Aplica el modo en el browser. Con `"system"` se borra el atributo para que
 * vuelva a mandar la media query — no se fuerza un valor calculado, así el
 * modo sigue al sistema si el usuario lo cambia con la app abierta.
 */
export function applyThemeMode(value: unknown): ThemeMode {
  const mode = resolveThemeMode(value);

  if (mode === "system") {
    delete document.documentElement.dataset.mode;
  } else {
    document.documentElement.dataset.mode = mode;
  }

  document.cookie = `${MODE_COOKIE}=${mode}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; samesite=lax`;
  return mode;
}

/**
 * Escala del theme como declaraciones de custom properties.
 * Útil para inyectar el theme en un `style` inline o generar CSS.
 */
export function themeCssVars(id: unknown): Record<string, string> {
  const { scale } = getTheme(id);
  return Object.fromEntries(BRAND_TONES.map((tone) => [`--brand-${tone}`, scale[tone]]));
}
