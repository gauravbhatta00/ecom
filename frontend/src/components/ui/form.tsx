"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import { Controller, FormProvider, useFormContext, type ControllerProps, type FieldPath, type FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";

export const Form = FormProvider;
const FieldContext = React.createContext<{ name: string } | null>(null);
const ItemContext = React.createContext<string | null>(null);

export function FormField<T extends FieldValues, N extends FieldPath<T>>(props: ControllerProps<T, N>) {
  return <FieldContext.Provider value={{ name: props.name }}><Controller {...props} /></FieldContext.Provider>;
}
function useFormField() {
  const field = React.useContext(FieldContext);
  const id = React.useContext(ItemContext);
  const { getFieldState, formState } = useFormContext();
  if (!field || !id) throw new Error("Form components must be inside FormField and FormItem.");
  return { id, ...getFieldState(field.name, formState) };
}
export function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId();
  return <ItemContext.Provider value={id}><div className={cn("space-y-2", className)} {...props} /></ItemContext.Provider>;
}
export function FormLabel(props: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { id } = useFormField();
  return <LabelPrimitive.Root htmlFor={id} className="text-xs font-medium" {...props} />;
}
export function FormControl(props: React.ComponentProps<typeof Slot>) {
  const { id, error } = useFormField();
  return <Slot id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} {...props} />;
}
export function FormMessage() {
  const { id, error } = useFormField();
  return error ? <p id={`${id}-error`} className="text-xs text-destructive" role="alert">{String(error.message || "Please check this field.")}</p> : null;
}
