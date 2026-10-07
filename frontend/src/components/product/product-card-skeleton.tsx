import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return <div className="min-w-0 space-y-3"><Skeleton className="aspect-[4/5] w-full" /><Skeleton className="h-3 w-1/3" /><Skeleton className="h-5 w-4/5" /><Skeleton className="h-4 w-1/3" /><Skeleton className="h-9 w-full" /></div>;
}
export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return <div role="status" className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4"><span className="sr-only">Loading products</span>{Array.from({ length: count }, (_, i) => <ProductCardSkeleton key={i} />)}</div>;
}
