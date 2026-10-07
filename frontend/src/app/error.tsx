"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="page-shell grid min-h-screen place-content-center gap-5 text-center"><h1 className="font-display text-4xl">Something went wrong.</h1><p className="text-muted-foreground">Please try loading the store again.</p><Button onClick={reset}>Try again</Button></main>;
}
