import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/cn";
import styles from "./SiteLogo.module.scss";

type Props = {
  className?: string;
};

export function SiteLogo({ className }: Props) {
  return (
    <Link
      href="/"
      aria-label="Ir al dashboard"
      className={cn("SiteLogo inline-flex shrink-0 items-center no-underline", className)}
    >
      <Image
        src="/logo.svg"
        alt="Recticar"
        width={110}
        height={36}
        className={cn("h-auto w-[130px] md:w-[170px]", styles.logo)}
        priority
      />
    </Link>
  );
}
