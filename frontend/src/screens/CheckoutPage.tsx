"use client";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Banknote, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiBaseUrl } from "@/lib/config";
import { authFetch } from "@/utils/auth";
import { checkoutSchema } from "@/lib/validation/checkout";
import { useCart } from "@/context/CartContext";
import { useCartUiStore } from "@/stores/cart-ui-store";
import type { CartBridge } from "@/components/cart/cart-items";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { StoreLink } from "@/components/ui/store-link";
import { formatPrice } from "@/lib/product";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const sending = useRef(false);
  const { cartItems, total, loading, error, clearCart } = useCart() as CartBridge & { clearCart: () => void };
  const pending = useCartUiStore(state => state.addingId);
  const form = useForm<z.input<typeof checkoutSchema>, unknown, z.output<typeof checkoutSchema>>({ resolver: zodResolver(checkoutSchema), defaultValues: { name: "", address: "", phone: "", payment_method: "COD" } });
  const submit = form.handleSubmit(async values => {
    if (sending.current || loading || pending || !cartItems.length) return;
    sending.current = true;
    try {
      const response = await authFetch(`${apiBaseUrl}/api/orders/create/`, { method: "POST", body: JSON.stringify(values) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "We couldn't place your order. Please try again.");
      clearCart(); toast.success("Your order has been placed."); navigate("/orders");
    } catch (failure) { form.setError("root", { message: failure instanceof Error ? failure.message : "Please try again." }); }
    finally { sending.current = false; }
  });
  return <main className="page-shell py-10 sm:py-16"><nav aria-label="Breadcrumb" className="mb-8 text-xs text-muted-foreground"><StoreLink to="/cart" className="underline">Your bag</StoreLink><span className="mx-3">/</span>Checkout</nav><p className="eyebrow">One more step</p><h1 className="mb-10 mt-3 font-display text-4xl sm:text-6xl">Make it yours.</h1>{loading ? <p role="status">Loading your bag…</p> : error ? <p role="alert" className="text-destructive">{error}</p> : !cartItems.length ? <div className="border-y border-border py-14"><h2 className="font-display text-3xl">Your bag is empty.</h2><Button asChild className="mt-6"><StoreLink to="/products">Explore the collection</StoreLink></Button></div> : <div className="grid gap-12 lg:grid-cols-[1fr_340px]">
    <Form {...form}><form onSubmit={submit} noValidate className="space-y-6"><h2 className="font-display text-2xl">Delivery details</h2>
      <FormField control={form.control} name="name" render={({ field }) => <FormItem><FormLabel>Full name</FormLabel><FormControl><Input {...field} autoComplete="name" className="w-full" /></FormControl><FormMessage /></FormItem>} />
      <FormField control={form.control} name="address" render={({ field }) => <FormItem><FormLabel>Delivery address</FormLabel><FormControl><textarea {...field} autoComplete="street-address" rows={3} placeholder="Street, city and postal code" className="w-full resize-y border border-border bg-background px-3 py-3 text-sm" /></FormControl><FormMessage /></FormItem>} />
      <FormField control={form.control} name="phone" render={({ field }) => <FormItem><FormLabel>Phone number</FormLabel><FormControl><Input {...field} type="tel" autoComplete="tel" className="w-full" /></FormControl><FormMessage /></FormItem>} />
      <fieldset className="border-t border-border pt-6"><legend className="pr-3 text-sm font-medium">Payment</legend><label className="flex min-h-14 items-center gap-3 border border-primary p-4 text-sm"><input type="radio" value="COD" {...form.register("payment_method")} defaultChecked className="size-4 accent-primary" /><Banknote size={18} />Cash on delivery</label><p className="mt-3 text-xs text-muted-foreground">Online payment is currently unavailable.</p></fieldset>
      {form.formState.errors.root && <p role="alert" className="text-sm text-destructive">{form.formState.errors.root.message}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting || Boolean(pending)}>{form.formState.isSubmitting && <Loader2 className="animate-spin" />}{form.formState.isSubmitting ? "Placing your order…" : `Place order · ${formatPrice(total)}`}</Button><p className="text-xs text-muted-foreground">Please review your details before placing your order.</p>
    </form></Form>
    <aside className="h-fit border border-border p-6 lg:sticky lg:top-8"><h2 className="font-display text-2xl">Your order</h2><ul className="my-6 divide-y divide-border">{cartItems.map(item => <li key={item.id} className="flex justify-between gap-4 py-4 text-sm"><span>{item.quantity} × {item.product_name}</span><span className="shrink-0">{formatPrice(Number(item.product_price ?? item.price ?? 0) * item.quantity)}</span></li>)}</ul><div className="flex justify-between border-t border-border pt-5 font-medium"><span>Total</span><span>{formatPrice(total)}</span></div><StoreLink to="/cart" className="mt-5 inline-flex min-h-11 items-center text-xs underline">Edit your bag</StoreLink></aside>
  </div>}</main>;
}

