import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: ComponentProps<"input">) { return <input className={cn("h-11 w-full min-w-0 rounded-sm border border-input bg-transparent px-3 text-base placeholder:text-muted-foreground focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive sm:text-sm", className)} {...props} />; }
