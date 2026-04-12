import { NextResponse } from "next/server";

type GeorefProvincia = {
  nombre: string;
};

type InfraProvincia = {
  nombre?: string;
};

async function getProvinciasFromInfra() {
  const response = await fetch(
    "https://infra.datos.gob.ar/catalog/modernizacion/dataset/7/distribution/7.2/download/provincias.json",
    {
      next: { revalidate: 60 * 60 * 24 },
    }
  );

  if (!response.ok) {
    throw new Error(`Infra provincias responded with ${response.status}`);
  }

  const data = (await response.json()) as { provincias?: InfraProvincia[] };

  return (data.provincias ?? [])
    .map((provincia) => provincia.nombre ?? "")
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "es"));
}

export async function GET() {
  try {
    const response = await fetch(
      "https://apis.datos.gob.ar/georef/api/v2.0/provincias?campos=nombre&max=100",
      {
        next: { revalidate: 60 * 60 * 24 },
      }
    );

    if (!response.ok) {
      const provincias = await getProvinciasFromInfra();
      return NextResponse.json({ provincias, source: "infra-fallback" });
    }

    const data = (await response.json()) as { provincias?: GeorefProvincia[] };
    const provincias = (data.provincias ?? [])
      .map((provincia) => provincia.nombre)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "es"));

    return NextResponse.json({ provincias, source: "georef" });
  } catch (error) {
    try {
      const provincias = await getProvinciasFromInfra();
      return NextResponse.json({ provincias, source: "infra-fallback" });
    } catch (fallbackError) {
      return NextResponse.json(
        {
          provincias: [],
          error:
            fallbackError instanceof Error
              ? fallbackError.message
              : error instanceof Error
                ? error.message
                : "No se pudieron cargar las provincias.",
        },
        { status: 500 }
      );
    }
  }
}
