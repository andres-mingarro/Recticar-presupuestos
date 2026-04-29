import { readFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

export async function getLogoDataUrl(): Promise<string | null> {
  try {
    const svgPath = join(process.cwd(), "public", "logo.svg");
    const svgBuffer = readFileSync(svgPath);
    const pngBuffer = await sharp(svgBuffer).png().toBuffer();
    return `data:image/png;base64,${pngBuffer.toString("base64")}`;
  } catch {
    return null;
  }
}
