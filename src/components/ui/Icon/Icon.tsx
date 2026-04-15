import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition, SizeProp } from "@fortawesome/fontawesome-svg-core";
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
  faClipboardList,
  faClock,
  faDownload,
  faEnvelope,
  faEye,
  faEyeSlash,
  faGaugeHigh,
  faGear,
  faHashtag,
  faIdCard,
  faKey,
  faListCheck,
  faLocationDot,
  faMagnifyingGlass,
  faPenToSquare,
  faPhone,
  faPlus,
  faPowerOff,
  faPrint,
  faQrcode,
  faShieldHalved,
  faSackDollar,
  faSackXmark,
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
  | "clipboardList"
  | "car"
  | "gauge"
  | "calendar"
  | "clock"
  | "listCheck"
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
  | "settings"
  | "sackDollar"
  | "sackXmark"
  | "eye"
  | "eyeSlash";

type IconProps = {
  name: IconName;
  className?: string;
  size?: SizeProp;
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
  clipboardList: faClipboardList,
  car: faCarSide,
  gauge: faGaugeHigh,
  calendar: faCalendarDays,
  clock: faClock,
  listCheck: faListCheck,
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
  sackDollar: faSackDollar,
  sackXmark: faSackXmark,
  eye: faEye,
  eyeSlash: faEyeSlash,
};

export function Icon({ name, className, size }: IconProps) {
  return (
    <FontAwesomeIcon
      icon={ICONS[name]}
      aria-hidden
      size={size}
      className={cn("Icon", styles.Icon, className)}
    />
  );
}
