import Link from "next/link";
import { cn } from "@/lib/cn";
import { buttonStyles } from "@/components/ui/Button";
import styles from "./ButtonAdd.module.scss";

type ButtonAddProps = {
  href: string;
  children: string;
  className?: string;
};

export function ButtonAdd({ href, children, className }: ButtonAddProps) {
  return (
    <Link
      href={href}
      className={buttonStyles({
        className: cn(
          "ButtonAdd",
          styles.ButtonAdd,
          "gap-2 !text-white bg-sky-600 uppercase hover:bg-sky-700 focus-visible:ring-sky-600",
          className
        ),
      })}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
      {children}
    </Link>
  );
}
