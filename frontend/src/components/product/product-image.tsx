"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { productImageSource } from "@/lib/product-image";

export function ProductImage({ src, alt, sizes, className, priority = false }: {
  src?: string; alt: string; sizes: string; className?: string; priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return (
    <div className={cn("flex h-full w-full flex-col items-center justify-center gap-3 bg-muted text-muted-foreground", className)}>
      <ImageOff size={24} aria-hidden="true" />
      <span className="px-2 text-center text-xs">Image unavailable</span>
      <span className="sr-only">{alt}</span>
    </div>
  );
  const imageSrc = productImageSource(src);
  return <Image src={imageSrc} alt={alt} fill sizes={sizes} priority={priority}
    unoptimized={imageSrc.startsWith("http")} onError={() => setFailed(true)}
    className={cn("object-cover", className)} />;
}
