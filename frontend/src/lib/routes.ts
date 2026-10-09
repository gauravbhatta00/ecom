export const routeTitles: Record<string, string> = {
  products: "Shop the collection",
  wishlist: "Saved pieces",
  product: "Product details",
  about: "Our story",
  contact: "Contact us",
  cart: "Your bag",
  login: "Log in",
  signup: "Create an account",
  dashboard: "My account",
  profile: "Profile",
  orders: "Orders",
  checkout: "Checkout",
  admin: "Admin",
  "forgot-password": "Reset your password",
  "reset-password": "Choose a new password",
};

export function isLegacyRoute(pathname: string) {
  return /^\/(?:products|wishlist|about|contact|cart|checkout|dashboard|profile|orders|login|signup|forgot-password|admin(?:\/(?:login|products))?)?\/?$/.test(pathname)
    || /^\/product\/[^/]+\/?$/.test(pathname)
    || /^\/reset-password\/[^/]+\/[^/]+\/?$/.test(pathname);
}

export const isPrivateRoute = (pathname: string) => /^\/(admin|dashboard|profile|orders|checkout|cart|login|signup|forgot-password|reset-password)(\/|$)/.test(pathname);
