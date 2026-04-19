import { cleanupExpiredPresupuestosEntregados } from "@/lib/maintenance/trabajos-cleanup";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : null;
  const headerToken = request.headers.get("x-cron-secret")?.trim() ?? null;

  return bearerToken === secret || headerToken === secret;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await cleanupExpiredPresupuestosEntregados();

  return Response.json(result, { status: 200 });
}
