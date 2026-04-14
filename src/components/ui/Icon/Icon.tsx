import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowRight,
  faBoxOpen,
  faCalendarDays,
  faCarSide,
  faCheck,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faClipboard,
  faClock,
  faDownload,
  faEnvelope,
  faGaugeHigh,
  faGear,
  faHashtag,
  faIdCard,
  faKey,
  faLocationDot,
  faMagnifyingGlass,
  faPenToSquare,
  faPhone,
  faPlus,
  faPowerOff,
  faPrint,
  faQrcode,
  faShieldHalved,
  faTag,
  faTrash,
  faUser,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import "@/lib/fontawesome";
import { cn } from "@/lib/cn";
import styles from "./Icon.module.scss";

export type IconName =
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
  | "printer"
  | "package"
  | "settings";

type IconProps = {
  name: IconName;
  className?: string;
};

const ICONS: Record<IconName, IconDefinition> = {
  plus: faPlus,
  search: faMagnifyingGlass,
  x: faXmark,
  chevronLeft: faChevronLeft,
  chevronRight: faChevronRight,
  chevronDown: faChevronDown,
  arrowRight: faArrowRight,
  hash: faHashtag,
  user: faUser,
  phone: faPhone,
  clipboard: faClipboard,
  car: faCarSide,
  gauge: faGaugeHigh,
  calendar: faCalendarDays,
  clock: faClock,
  edit: faPenToSquare,
  mail: faEnvelope,
  mapPin: faLocationDot,
  check: faCheck,
  download: faDownload,
  tag: faTag,
  trash: faTrash,
  key: faKey,
  power: faPowerOff,
  shieldUser: faShieldHalved,
  idCard: faIdCard,
  qrCode: faQrcode,
  printer: faPrint,
  package: faBoxOpen,
  settings: faGear,
};

export function Icon({ name, className }: IconProps) {
  return (
    <FontAwesomeIcon
      icon={ICONS[name]}
      aria-hidden
      className={cn("Icon", styles.Icon, className)}
    />
  );
}
