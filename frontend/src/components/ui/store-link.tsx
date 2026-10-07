"use client";

import type { ComponentProps } from "react";
import NextLink from "next/link";
import { Link as RouterLink, useInRouterContext } from "react-router-dom";

export function StoreLink({ to, ...props }: Omit<ComponentProps<"a">, "href"> & { to: string }) {
  const inLegacyRouter = useInRouterContext();
  if (to.startsWith("/") && !to.startsWith("//")) {
    if (inLegacyRouter && to.split(/[?#]/)[0] !== "/") return <RouterLink to={to} {...props} />;
    return <NextLink href={to} prefetch={false} {...props} />;
  }
  return <a href={to} {...props} />;
}
