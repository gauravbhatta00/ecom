"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;
export const SheetTitle = DialogPrimitive.Title;
export const SheetDescription = DialogPrimitive.Description;

export function SheetContent({ children, className, side = "left", ...props }: React.ComponentProps<typeof DialogPrimitive.Content> & { side?: "left" | "right" }) {
  return <DialogPrimitive.Portal><DialogPrimitive.Overlay className="overlay-motion fixed inset-0 z-[80] bg-black/40" /><DialogPrimitive.Content data-side={side} className={cn("sheet-motion fixed inset-y-0 z-[90] flex w-[min(90vw,400px)] flex-col overflow-y-auto bg-background p-6 shadow-overlay", side === "left" ? "left-0 border-r border-border" : "right-0 border-l border-border", className)} {...props}>{children}<DialogPrimitive.Close className="absolute right-3 top-3 grid size-11 place-items-center rounded-sm hover:bg-muted"><X className="size-5" /><span className="sr-only">Close menu</span></DialogPrimitive.Close></DialogPrimitive.Content></DialogPrimitive.Portal>;
}
