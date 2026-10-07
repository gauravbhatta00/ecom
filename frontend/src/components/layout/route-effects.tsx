"use client";

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { isPrivateRoute, routeTitles } from "@/lib/routes";

export function RouteEffects() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const title = routeTitles[pathname.split("/")[1]];
    document.title = title ? `${title} | LeloVaiLelo` : "LeloVaiLelo — Good finds, daily";
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = new URL(pathname, process.env.NEXT_PUBLIC_SITE_URL || window.location.origin).href;
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robots) { robots = document.createElement("meta"); robots.name = "robots"; document.head.appendChild(robots); }
    robots.content = isPrivateRoute(pathname) ? "noindex, nofollow" : "index, follow";
    if (!hash) { window.scrollTo({ top: 0, behavior: "instant" }); document.getElementById("main-content")?.focus({ preventScroll: true }); }
  }, [pathname, hash]);
  return null;
}
