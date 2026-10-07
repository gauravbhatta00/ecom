import { ArrowUpRight } from "lucide-react";
import { StoreLink } from "@/components/ui/store-link";

export function SectionHeading({ eyebrow, title, description, href, linkLabel = "Explore all", id }: {
  eyebrow?: string; title: string; description?: string; href?: string; linkLabel?: string; id?: string;
}) {
  return <div className="mb-7 flex flex-wrap items-end justify-between gap-5 sm:mb-10">
    <div>{eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}<h2 id={id} className="font-display text-3xl leading-tight tracking-[-.025em] sm:text-4xl lg:text-[44px]">{title}</h2>{description && <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">{description}</p>}</div>
    {href && <StoreLink to={href} className="flex items-center gap-3 border-b border-foreground pb-2 text-xs font-medium">{linkLabel}<ArrowUpRight size={15} /></StoreLink>}
  </div>;
}
