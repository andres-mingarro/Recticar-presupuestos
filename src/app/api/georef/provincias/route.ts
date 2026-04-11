import { NextResponse } from "next/server";

type GeorefProvincia = {
  nombre: string;
};

export async function GET() {
  try {
    const response = await fetch(
      "https://apis.datos.gob.ar/georef/api/v2.0/provincias?campos=nombre&max=100",
      {
        next: { revalidate: 60 * 60 * 24 },
      }
    );

    if (!response.ok) {
      throw new Error(`Georef responded with ${response.status}`);
    }

    const data = (await response.json()) as { provincias?: GeorefProvincia[] };
    const provincias = (data.provincias ?? [])
      .map((provincia) => provincia.nombre)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "es"));

    return NextResponse.json({ provincias });
  } catch (error) {
    return NextResponse.json(
      {
        provincias: [],
        error:
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las provincias.",
      },
      { status: 500 }
    );
  }
}
