"use client";

import * as React from "react";
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;
export function DropdownMenuContent({ className, sideOffset = 8, ...props }: React.ComponentProps<typeof DropdownPrimitive.Content>) {
  return <DropdownPrimitive.Portal><DropdownPrimitive.Content sideOffset={sideOffset} className={cn("overlay-motion z-[95] min-w-56 rounded-sm border border-border bg-popover p-2 text-popover-foreground shadow-overlay", className)} {...props} /></DropdownPrimitive.Portal>;
}
export function DropdownMenuItem({ className, ...props }: React.ComponentProps<typeof DropdownPrimitive.Item>) {
  return <DropdownPrimitive.Item className={cn("flex cursor-default items-center gap-3 rounded-sm px-3 py-3 text-sm outline-none focus:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4", className)} {...props} />;
}
export function DropdownMenuLabel(props: React.ComponentProps<typeof DropdownPrimitive.Label>) { return <DropdownPrimitive.Label className="px-3 py-2 text-xs font-medium text-muted-foreground" {...props} />; }
export function DropdownMenuSeparator() { return <DropdownPrimitive.Separator className="my-1 h-px bg-border" />; }
