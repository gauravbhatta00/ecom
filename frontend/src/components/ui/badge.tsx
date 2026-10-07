import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: ComponentProps<"span">) {
  return <span className={cn("inline-flex border border-border bg-background/95 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider", className)} {...props} />;
}
