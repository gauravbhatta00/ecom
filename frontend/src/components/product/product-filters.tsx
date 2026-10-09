"use client";
import { useId, useState } from "react";
import type { Product } from "@/types/product";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { catalogCategories } from "@/lib/categories";
import type { Category } from "@/types/category";

export function ProductFilters({ products, categories: suppliedCategories, params, onApply }: { products: Product[]; categories?: Category[]; params: URLSearchParams; onApply: (values: Record<string, string>) => void }) {
  const id = useId();
  const [error, setError] = useState("");
  const categories = suppliedCategories?.length ? suppliedCategories : catalogCategories(products);
  const selected = categories.find(category => [String(category.id), category.name.toLowerCase(), category.slug].includes((params.get("category") || "").toLowerCase()));
  const [department, setDepartment] = useState(selected ? String(selected.parent || selected.id) : "");
  const [subcategory, setSubcategory] = useState(selected?.parent ? String(selected.id) : "");
  const roots = categories.filter(category => !category.parent);
  const children = categories.filter(category => String(category.parent) === department);
  return <form className="space-y-8" onSubmit={event => {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    const min = String(data.get("min") || "");
    const max = String(data.get("max") || "");
    if (min && max && Number(min) > Number(max)) { setError("The maximum price must be at least the minimum price."); return; }
    setError("");
    onApply({ category: categories.find(category => String(category.id) === (subcategory || department))?.slug || "", min: String(data.get("min") || ""), max: String(data.get("max") || ""), available: data.has("available") ? "1" : "" });
  }}>
    <div><label htmlFor={id + "-category"} className="mb-3 block text-sm font-medium">Category</label><select id={id + "-category"} value={department} onChange={event => { setDepartment(event.target.value); setSubcategory(""); }} className="min-h-11 w-full border border-border bg-background px-3 text-sm"><option value="">All clothing</option>{roots.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
    {children.length > 0 && <div><label htmlFor={id + "-subcategory"} className="mb-3 block text-sm font-medium">Subcategory</label><select id={id + "-subcategory"} value={subcategory} onChange={event => setSubcategory(event.target.value)} className="min-h-11 w-full border border-border bg-background px-3 text-sm"><option value="">All {roots.find(category => String(category.id) === department)?.name}</option>{children.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>}
    <fieldset><legend className="mb-4 text-sm font-medium">Price (USD)</legend><div className="grid grid-cols-2 gap-3">
      <div><label htmlFor={id + "-min"} className="text-xs text-muted-foreground">From</label><Input id={id + "-min"} name="min" type="number" min="0" step="0.01" placeholder="0" defaultValue={params.get("min") || ""} className="mt-2 w-full" /></div>
      <div><label htmlFor={id + "-max"} className="text-xs text-muted-foreground">To</label><Input id={id + "-max"} name="max" type="number" min="0" step="0.01" placeholder="Any" defaultValue={params.get("max") || ""} className="mt-2 w-full" /></div>
    </div></fieldset>
    <label className="flex min-h-11 items-center gap-3 text-sm"><input name="available" type="checkbox" defaultChecked={params.get("available") === "1"} className="size-4 accent-primary" />In stock only</label>
    {error && <p role="alert" className="text-xs leading-5 text-destructive">{error}</p>}
    <Button className="w-full" type="submit">Apply filters</Button>
  </form>;
}
