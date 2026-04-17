import logotypes from "@avto-dev/vehicle-logotypes/src/vehicle-logotypes.json" with { type: "json" };

const ALIASES: Record<string, string> = {
  "mercedes benz": "mercedes-benz",
  "mercedes-benz": "mercedes-benz",
  "mercedes": "mercedes-benz",
  "land rover": "land-rover",
  "great wall": "great-wall",
  "ssangyong": "ssangyong",
  "mg": "mg",
};

export function getBrandLogoUrl(nombre: string): string | null {
  const normalized = nombre.toLowerCase().trim();
  const key = ALIASES[normalized] ?? normalized.replace(/\s+/g, "-");
  const entry = (logotypes as Record<string, { logotype: { uri: string } }>)[key];
  return entry?.logotype?.uri ?? null;
}
