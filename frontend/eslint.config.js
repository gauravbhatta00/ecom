import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores(["dist/**", ".next/**", "next-env.d.ts", "node_modules/**"]),
  {
    // Existing screens migrate to Next image/link components feature by feature.
    files: ["src/pages/**/*.jsx", "src/components/**/*.jsx", "src/ui/**/*.jsx", "src/context/**/*.jsx"],
    rules: { "@next/next/no-img-element": "off", "@next/next/no-html-link-for-pages": "off" },
  },
]);
