"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Accordion = AccordionPrimitive.Root;
export function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) { return <AccordionPrimitive.Item className={cn("border-b border-border", className)} {...props} />; }
export function AccordionTrigger({ children, className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return <AccordionPrimitive.Header><AccordionPrimitive.Trigger className={cn("flex w-full items-center justify-between py-4 text-left text-sm font-medium [&[data-state=open]>svg]:rotate-180", className)} {...props}>{children}<ChevronDown className="size-4 transition-transform" /></AccordionPrimitive.Trigger></AccordionPrimitive.Header>;
}
export function AccordionContent({ children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Content>) { return <AccordionPrimitive.Content {...props}><div className="pb-4">{children}</div></AccordionPrimitive.Content>; }
