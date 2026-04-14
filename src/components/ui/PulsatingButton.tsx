import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { buttonStyles } from "@/components/ui/Button";

const DEFAULT_DISTANCE = "12px";
const DEFAULT_DURATION = "1.5s";
const DEFAULT_PULSE_COLOR = "var(--color-accent)";

type PulsatingButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  pulsing?: boolean;
  variant?: "pulse" | "ripple";
  distance?: string;
  duration?: string;
  pulseColor?: string;
};

export function PulsatingButton({
  className,
  children,
  pulsing = false,
  variant = "pulse",
  distance = DEFAULT_DISTANCE,
  duration = DEFAULT_DURATION,
  pulseColor = DEFAULT_PULSE_COLOR,
  style,
  ...props
}: PulsatingButtonProps) {
  const buttonStyle = {
    "--pulsating-button-distance": distance,
    "--pulsating-button-duration": duration,
    "--pulsating-button-color": pulseColor,
    ...style,
  } as CSSProperties;

  return (
    <>
      <button
        className={buttonStyles({ className: cn("relative isolate overflow-visible", className) })}
        style={buttonStyle}
        {...props}
      >
        {pulsing && (
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute -z-10 rounded-[inherit]",
              variant === "ripple"
                ? "inset-[calc(var(--pulsating-button-distance)*-1)] border border-[var(--pulsating-button-color)] opacity-0 [animation:recticar-pulsating-button-ripple_var(--pulsating-button-duration)_ease-out_infinite]"
                : "inset-0 opacity-0 [animation:recticar-pulsating-button-pulse_var(--pulsating-button-duration)_ease-out_infinite]"
            )}
          />
        )}
        <span className="relative z-10 inline-flex items-center justify-center">
          {children}
        </span>
      </button>

      <style jsx>{`
        @keyframes recticar-pulsating-button-pulse {
          0% {
            opacity: 0.45;
            box-shadow: 0 0 0 0 var(--pulsating-button-color);
          }
          70% {
            opacity: 0;
            box-shadow: 0 0 0 var(--pulsating-button-distance) transparent;
          }
          100% {
            opacity: 0;
            box-shadow: 0 0 0 var(--pulsating-button-distance) transparent;
          }
        }

        @keyframes recticar-pulsating-button-ripple {
          0% {
            opacity: 0.45;
            transform: scale(0.92);
          }
          70% {
            opacity: 0;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}
