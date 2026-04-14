"use client";

import { useEffect, useId, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove?: (widgetId: string) => void;
    };
  }
}

const TURNSTILE_SCRIPT_ID = "cloudflare-turnstile-script";

function ensureTurnstileScript() {
  if (document.getElementById(TURNSTILE_SCRIPT_ID)) return;

  const script = document.createElement("script");
  script.id = TURNSTILE_SCRIPT_ID;
  script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

type Props = {
  siteKey: string;
  onTokenChange: (token: string) => void;
  resetKey?: number;
};

export function TurnstileWidget({ siteKey, onTokenChange, resetKey = 0 }: Props) {
  const containerId = useId();
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let intervalId: number | undefined;

    onTokenChange("");
    ensureTurnstileScript();

    const renderWidget = () => {
      if (cancelled || widgetIdRef.current || !window.turnstile) return;

      const container = document.getElementById(containerId);
      if (!container) return;

      widgetIdRef.current = window.turnstile.render(container, {
        sitekey: siteKey,
        callback: (token) => onTokenChange(token),
        "expired-callback": () => onTokenChange(""),
        "error-callback": () => onTokenChange(""),
      });
    };

    renderWidget();

    if (!widgetIdRef.current) {
      intervalId = window.setInterval(renderWidget, 250);
    }

    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
      if (widgetIdRef.current && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, [containerId, onTokenChange, siteKey]);

  useEffect(() => {
    if (!widgetIdRef.current || !window.turnstile) return;

    onTokenChange("");
    window.turnstile.reset(widgetIdRef.current);
  }, [onTokenChange, resetKey]);

  return <div id={containerId} className="TurnstileWidget min-h-[65px]" />;
}
