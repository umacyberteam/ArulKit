import Link from "next/link";
import type { ComponentProps } from "react";
import { buttonVariants, type Variant, type Size } from "@/components/ui/button";

export function LinkButton({
  href,
  variant,
  size,
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  return (
    <Link href={href} className={buttonVariants({ variant, size, className })} {...props}>
      {children}
    </Link>
  );
}
