import { NextRequest, NextResponse } from "next/server";

type GeorefLocalidad = {
  nombre: string;
};

export async function GET(request: NextRequest) {
  const provincia = request.nextUrl.searchParams.get("provincia")?.trim();

  if (!provincia) {
    return NextResponse.json({ localidades: [] });
  }

  try {
    const url = new URL("https://apis.datos.gob.ar/georef/api/v2.0/localidades");
    url.searchParams.set("provincia", provincia);
    url.searchParams.set("campos", "nombre");
    url.searchParams.set("max", "1000");

    const response = await fetch(url, {
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!response.ok) {
      throw new Error(`Georef responded with ${response.status}`);
    }

    const data = (await response.json()) as { localidades?: GeorefLocalidad[] };
    const localidades = Array.from(
      new Set(
        (data.localidades ?? [])
          .map((localidad) => localidad.nombre)
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b, "es"));

    return NextResponse.json({ localidades });
  } catch (error) {
    return NextResponse.json(
      {
        localidades: [],
        error:
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las localidades.",
      },
      { status: 500 }
    );
  }
}
