import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "_site/**",
    "_testsite/**",
    "astro/dist/**",
    "astro/.astro/**",
    ".open-next/**",
    ".wrangler/**",
    "next-env.d.ts",
    "cloudflare-env.d.ts",
    "worker-configuration.d.ts",
  ]),
]);

export default eslintConfig;
