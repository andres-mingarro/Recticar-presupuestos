type TurnstileSiteVerifyResponse = {
  success: boolean;
  "error-codes"?: string[];
};

function getTurnstileConfig() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  const secretKey = process.env.TURNSTILE_SECRET_KEY?.trim();

  return {
    siteKey,
    secretKey,
    enabled: Boolean(siteKey && secretKey),
    misconfigured: Boolean(siteKey || secretKey) && !(siteKey && secretKey),
  };
}

export function isTurnstileEnabled() {
  return getTurnstileConfig().enabled;
}

export async function verifyTurnstileToken({
  token,
  remoteIp,
}: {
  token?: string;
  remoteIp?: string;
}) {
  const { secretKey, enabled, misconfigured } = getTurnstileConfig();

  if (!enabled) {
    if (misconfigured) {
      return {
        ok: false,
        status: 500,
        error: "Turnstile no está configurado correctamente.",
      };
    }

    return { ok: true, status: 200 };
  }

  if (!token) {
    return {
      ok: false,
      status: 400,
      error: "Confirmá el captcha para continuar.",
    };
  }

  try {
    const body = new URLSearchParams({
      secret: secretKey!,
      response: token,
    });

    if (remoteIp) {
      body.set("remoteip", remoteIp);
    }

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        ok: false,
        status: 502,
        error: "No se pudo validar el captcha. Intentá de nuevo.",
      };
    }

    const result = await response.json() as TurnstileSiteVerifyResponse;

    if (!result.success) {
      return {
        ok: false,
        status: 400,
        error: "La validación del captcha no fue aceptada. Intentá de nuevo.",
      };
    }

    return { ok: true, status: 200 };
  } catch {
    return {
      ok: false,
      status: 502,
      error: "No se pudo verificar el captcha. Intentá de nuevo.",
    };
  }
}
