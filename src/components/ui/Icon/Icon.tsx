import { cn } from "@/lib/cn";
import styles from "./Icon.module.scss";

type IconName =
  | "plus"
  | "search"
  | "x"
  | "chevronLeft"
  | "chevronRight"
  | "chevronDown"
  | "arrowRight"
  | "hash"
  | "user"
  | "phone"
  | "clipboard"
  | "car"
  | "gauge"
  | "calendar"
  | "clock"
  | "edit"
  | "mail"
  | "mapPin"
  | "check"
  | "download"
  | "tag"
  | "trash"
  | "key"
  | "power"
  | "shieldUser"
  | "idCard"
  | "qrCode"
  | "printer";

type IconProps = {
  name: IconName;
  className?: string;
};

export function Icon({ name, className }: IconProps) {
  const commonProps = {
    "aria-hidden": true,
    viewBox: "0 0 24 24",
    className: cn("Icon", styles.Icon, className),
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "plus":
      return (
        <svg {...commonProps}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );
    case "search":
      return (
        <svg {...commonProps}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      );
    case "x":
      return (
        <svg {...commonProps}>
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      );
    case "chevronLeft":
      return (
        <svg {...commonProps}>
          <path d="m15 18-6-6 6-6" />
        </svg>
      );
    case "chevronRight":
      return (
        <svg {...commonProps}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      );
    case "arrowRight":
      return (
        <svg {...commonProps}>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );
    case "hash":
      return (
        <svg {...commonProps}>
          <path d="M4 9h16" />
          <path d="M4 15h16" />
          <path d="M10 3 8 21" />
          <path d="m16 3-2 18" />
        </svg>
      );
    case "user":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="8" r="4" />
          <path d="M6 20a6 6 0 0 1 12 0" />
        </svg>
      );
    case "phone":
      return (
        <svg {...commonProps}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.35 1.78.68 2.62a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.46-1.25a2 2 0 0 1 2.11-.45c.84.33 1.72.56 2.62.68A2 2 0 0 1 22 16.92Z" />
        </svg>
      );
    case "clipboard":
      return (
        <svg {...commonProps}>
          <rect x="8" y="2" width="8" height="4" rx="1" />
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        </svg>
      );
    case "car":
      return (
        <svg {...commonProps}>
          <path d="m14 16 1-4H9l1 4" />
          <path d="M3 12h18l-2-5a2 2 0 0 0-1.88-1.32H6.88A2 2 0 0 0 5 7Z" />
          <circle cx="7.5" cy="16.5" r="1.5" />
          <circle cx="16.5" cy="16.5" r="1.5" />
        </svg>
      );
    case "gauge":
      return (
        <svg {...commonProps}>
          <path d="M12 14 16.5 9.5" />
          <path d="M20 14a8 8 0 1 0-16 0" />
          <path d="M12 20v-2" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...commonProps}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4" />
          <path d="M8 2v4" />
          <path d="M3 10h18" />
        </svg>
      );
    case "clock":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 3" />
        </svg>
      );
    case "edit":
      return (
        <svg {...commonProps}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      );
    case "mail":
      return (
        <svg {...commonProps}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      );
    case "mapPin":
      return (
        <svg {...commonProps}>
          <path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10Z" />
          <circle cx="12" cy="11" r="2.5" />
        </svg>
      );
    case "chevronDown":
      return (
        <svg {...commonProps}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );
    case "check":
      return (
        <svg {...commonProps}>
          <path d="M20 6 9 17l-5-5" />
        </svg>
      );
    case "download":
      return (
        <svg {...commonProps}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" x2="12" y1="15" y2="3" />
        </svg>
      );
    case "tag":
      return (
        <svg {...commonProps}>
          <path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0l7.29-7.29a1 1 0 0 0 0-1.41Z" />
          <circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case "trash":
      return (
        <svg {...commonProps}>
          <path d="M3 6h18" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      );
    case "key":
      return (
        <svg {...commonProps}>
          <circle cx="7.5" cy="15.5" r="5.5" />
          <path d="m21 2-9.6 9.6" />
          <path d="m15.5 7.5 3 3L22 7l-3-3" />
        </svg>
      );
    case "power":
      return (
        <svg {...commonProps}>
          <path d="M12 2v10" />
          <path d="M18.4 6.6a9 9 0 1 1-12.77 0" />
        </svg>
      );
    case "shieldUser":
      return (
        <svg {...commonProps}>
          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z" />
          <circle cx="12" cy="10" r="2" />
          <path d="M8.5 17a5 5 0 0 1 7 0" />
        </svg>
      );
    case "idCard":
      return (
        <svg {...commonProps}>
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <circle cx="8" cy="12" r="2" />
          <path d="M4 20a4 4 0 0 1 8 0" />
          <path d="M14 10h4" />
          <path d="M14 14h4" />
        </svg>
      );
    case "printer":
      return (
        <svg {...commonProps}>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
          <rect x="6" y="14" width="12" height="8" rx="1" />
        </svg>
      );
    case "qrCode":
      return (
        <svg {...commonProps}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <path d="M14 14h1v1h-1z" />
          <path d="M17 14h1v1h-1z" />
          <path d="M20 14h1v1h-1z" />
          <path d="M14 17h1v1h-1z" />
          <path d="M17 17h1v1h-1z" />
          <path d="M20 17h1v1h-1z" />
          <path d="M14 20h1v1h-1z" />
          <path d="M17 20h1v1h-1z" />
          <path d="M20 20h1v1h-1z" />
        </svg>
      );
  }
}
