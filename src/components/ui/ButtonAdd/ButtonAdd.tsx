import Link from "next/link";
import { cn } from "@/lib/cn";
import { buttonStyles } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import styles from "./ButtonAdd.module.scss";

type ButtonAddProps = {
  children: string;
  className?: string;
} & (
  | { href: string; onClick?: never }
  | { onClick: () => void; href?: never }
);

export function ButtonAdd({ href, onClick, children, className }: ButtonAddProps) {
  const cls = buttonStyles({
    className: cn(
      "ButtonAdd",
      styles.ButtonAdd,
      "gap-2 !text-white bg-sky-600 uppercase hover:bg-sky-700 focus-visible:ring-sky-600",
      className
    ),
  });

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls}>
        <Icon name="plus" className="h-4 w-4" />
        {children}
      </button>
    );
  }

  return (
    <Link href={href!} className={cls}>
      <Icon name="plus" className="h-4 w-4" />
      {children}
    </Link>
  );
}
