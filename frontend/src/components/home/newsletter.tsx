"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { newsletterSchema, type NewsletterValues } from "@/lib/validation/newsletter";
import { subscribeNewsletter } from "@/lib/api/newsletter";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NewsletterSection({ enabled }: { enabled: boolean }) {
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const form = useForm<NewsletterValues>({ resolver: zodResolver(newsletterSchema), defaultValues: { email: "", consent: false } });
  const submit = async (values: NewsletterValues) => {
    setError("");
    try { await subscribeNewsletter(values); setComplete(true); form.reset(); toast.success("You're on the list. Welcome to good company."); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Please try again later."); }
  };

  return <section className="border-y border-border bg-secondary/50 py-14 sm:py-20">
    <div className="page-shell grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-20">
      <div><p className="eyebrow">Letters from LeloVaiLelo</p><h2 className="mt-4 font-display text-4xl sm:text-5xl">A little good<br /><span className="italic">in your inbox.</span></h2><p className="mt-5 max-w-sm text-sm leading-6 text-muted-foreground">New discoveries, thoughtful edits, and the occasional note from us. No clutter.</p></div>
      <div>
        {complete ? <p role="status" className="border-y border-border py-8 font-display text-2xl">You’re on the list. Welcome to good company.</p> : <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} noValidate className="space-y-4">
            <FormField control={form.control} name="email" render={({ field }) => <FormItem><FormLabel>Your email address</FormLabel><div className="flex gap-2"><FormControl><Input {...field} type="email" autoComplete="email" placeholder="you@example.com" disabled={!enabled || form.formState.isSubmitting} className="bg-background" /></FormControl><Button type="submit" disabled={!enabled || form.formState.isSubmitting} aria-label="Subscribe to the newsletter" size="icon">{form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <ArrowRight />}</Button></div><FormMessage /></FormItem>} />
            {enabled && <FormField control={form.control} name="consent" render={({ field }) => <FormItem><div className="flex items-start gap-3"><FormControl><input type="checkbox" name={field.name} ref={field.ref} checked={field.value} onBlur={field.onBlur} onChange={event => field.onChange(event.target.checked)} className="mt-0.5 size-4 shrink-0 accent-primary" /></FormControl><FormLabel>I’d like to receive the newsletter. I can unsubscribe at any time.</FormLabel></div><FormMessage /></FormItem>} />}
            {!enabled && <p className="text-xs leading-5 text-muted-foreground">Newsletter sign-ups are opening soon. Check back for the first edition.</p>}
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          </form>
        </Form>}
      </div>
    </div>
  </section>;
}
