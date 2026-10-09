"use client";
import * as Primitive from "@radix-ui/react-dialog";
import type { ComponentProps } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
export const Dialog = Primitive.Root;
export const DialogTrigger = Primitive.Trigger;
export const DialogTitle = Primitive.Title;
export const DialogDescription = Primitive.Description;
export const DialogClose = Primitive.Close;
export function DialogContent({ className, children, ...props }: ComponentProps<typeof Primitive.Content>) {
  return <Primitive.Portal><Primitive.Overlay className="fixed inset-0 z-[80] bg-black/45 overlay-motion" /><Primitive.Content className={cn("fixed left-1/2 top-1/2 z-[90] max-h-[90dvh] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto border border-border bg-background p-6 sm:p-10 overlay-motion", className)} {...props}>{children}<Primitive.Close className="absolute right-2 top-2 grid size-11 place-items-center bg-background hover:bg-muted" aria-label="Close dialog"><X size={20} /></Primitive.Close></Primitive.Content></Primitive.Portal>;
}

