import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button, type ButtonVariant, type ButtonSize } from "@/components/ui/Button";

const DEFAULT_DISTANCE = "12px";
const DEFAULT_DURATION = "1.5s";
const DEFAULT_PULSE_COLOR = "var(--color-accent)";

type PulsatingButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  pulsing?: boolean;
  pulseStyle?: "pulse" | "ripple";
  variant?: ButtonVariant;
  size?: ButtonSize;
  distance?: string;
  duration?: string;
  pulseColor?: string;
  icon?: ReactNode;
  iconRight?: ReactNode;
};

export function PulsatingButton({
  className,
  children,
  pulsing = false,
  pulseStyle = "pulse",
  variant,
  size = "md",
  distance = DEFAULT_DISTANCE,
  duration = DEFAULT_DURATION,
  pulseColor = DEFAULT_PULSE_COLOR,
  icon,
  iconRight,
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
      <Button
        variant={variant}
        size={size}
        icon={icon}
        iconRight={iconRight}
        className={cn("relative isolate overflow-visible", className)}
        style={buttonStyle}
        {...props}
      >
        {pulsing && (
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute -z-10 rounded-[inherit]",
              pulseStyle === "ripple"
                ? "inset-[calc(var(--pulsating-button-distance)*-1)] border border-[var(--pulsating-button-color)] opacity-0 [animation:recticar-pulsating-button-ripple_var(--pulsating-button-duration)_ease-out_infinite]"
                : "inset-0 opacity-0 [animation:recticar-pulsating-button-pulse_var(--pulsating-button-duration)_ease-out_infinite]"
            )}
          />
        )}
        {children}
      </Button>

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
