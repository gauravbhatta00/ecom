"use client";

import * as React from "react";
import * as NavigationPrimitive from "@radix-ui/react-navigation-menu";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const NavigationMenu = NavigationPrimitive.Root;
export const NavigationMenuList = NavigationPrimitive.List;
export const NavigationMenuItem = NavigationPrimitive.Item;
export const NavigationMenuLink = NavigationPrimitive.Link;
export function NavigationMenuTrigger({ children, className, ...props }: React.ComponentProps<typeof NavigationPrimitive.Trigger>) {
  return <NavigationPrimitive.Trigger className={cn("group inline-flex h-11 items-center gap-1 px-3 text-sm hover:text-primary", className)} {...props}>{children}<ChevronDown className="size-3 transition-transform group-data-[state=open]:rotate-180" /></NavigationPrimitive.Trigger>;
}
export function NavigationMenuContent({ className, ...props }: React.ComponentProps<typeof NavigationPrimitive.Content>) {
  return <NavigationPrimitive.Content className={cn("overlay-motion absolute left-0 top-full z-50 w-[600px] border border-border bg-popover p-7 text-popover-foreground shadow-overlay", className)} {...props} />;
}
