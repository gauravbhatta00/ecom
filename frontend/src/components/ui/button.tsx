import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva("inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:size-4 [&_svg]:shrink-0", {
  variants: {
    variant: { primary: "bg-primary text-primary-foreground hover:bg-primary/90", secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80", outline: "border border-border bg-transparent hover:bg-muted", ghost: "hover:bg-muted", destructive: "bg-destructive text-white hover:bg-destructive/90", icon: "hover:bg-muted" },
    size: { sm: "h-9 px-3 text-xs", md: "h-11 px-5", lg: "h-13 px-7", icon: "size-11 p-0" },
  }, defaultVariants: { variant: "primary", size: "md" },
});

export function Button({ className, variant, size, asChild = false, ...props }: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
