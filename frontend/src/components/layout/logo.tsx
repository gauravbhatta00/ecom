import { StoreLink as Link } from "@/components/ui/store-link";

export function Logo({ inverse = false }: { inverse?: boolean }) {
  return <Link to="/" aria-label="LeloVaiLelo home" className={`inline-flex shrink-0 flex-col ${inverse ? "text-white" : "text-foreground"}`}><span className="font-display text-[23px] leading-none tracking-[-.06em] sm:text-[28px]">LeloVaiLelo<span className="text-accent">.</span></span><span className="mt-1.5 text-[8px] font-medium uppercase tracking-[.24em] sm:text-[9px]">Good finds, daily</span></Link>;
}
