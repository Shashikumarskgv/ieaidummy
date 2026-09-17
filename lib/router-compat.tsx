"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export interface NavLinkProps extends Omit<React.ComponentProps<typeof Link>, "className" | "children" | "href"> {
  to: string;
  end?: boolean;
  className?: string | ((props: { isActive: boolean }) => string);
  children?: React.ReactNode | ((props: { isActive: boolean }) => React.ReactNode);
}

export const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ to, end, className, children, ...props }, ref) => {
    const pathname = usePathname();
    const isActive = end ? pathname === to : pathname.startsWith(to);

    const resolvedClassName =
      typeof className === "function" ? className({ isActive }) : className;

    const resolvedChildren =
      typeof children === "function" ? children({ isActive }) : children;

    return (
      <Link href={to} ref={ref} className={resolvedClassName} {...props}>
        {resolvedChildren}
      </Link>
    );
  }
);
NavLink.displayName = "NavLink";

export function useNavigate() {
  const router = useRouter();
  return (to: string | number, options?: { replace?: boolean }) => {
    if (typeof to === "number") {
      if (to === -1) {
        router.back();
      }
    } else {
      if (options?.replace) {
        router.replace(to);
      } else {
        router.push(to);
      }
    }
  };
}

export const Outlet = () => null;
