import Link from "next/link";
import { cn } from "@/lib/cn";
import { buttonStyles } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
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
      <Icon name="plus" className="h-4 w-4" />
      {children}
    </Link>
  );
}
