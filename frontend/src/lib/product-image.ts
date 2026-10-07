import { apiBaseUrl } from "./config";

// Only the configured backend's public product uploads use the image proxy.
export function productImageSource(src: string): string {
  try {
    const url = new URL(src);
    if (url.origin === new URL(apiBaseUrl).origin && url.pathname.startsWith("/media/products/") && !url.search) {
      return `/catalog-media/${url.pathname.slice("/media/products/".length)}`;
    }
  } catch { /* Local image paths already work with Next Image. */ }
  return src;
}
