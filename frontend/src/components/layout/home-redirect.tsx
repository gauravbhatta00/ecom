"use client";

import { useEffect } from "react";

export function HomeRedirect() {
  useEffect(() => { window.location.replace(new URL("/", window.location.origin).href); }, []);
  return <p role="status" className="page-shell py-12">Opening the collection…</p>;
}
