import type { AstroIntegration } from "astro";
import { rmSync } from "node:fs";

/**
 * Remove translated documentation
 */
export function removeTranslatedDoc(): AstroIntegration {
  return {
    name: "remove-translated-doc",
    hooks: {
      "astro:build:done": async ({ pages, assets }) => {
        for (const page of assets.get('/[...slug]') ?? []) {
          if (page.pathname.includes('/fr/docs')) {
            rmSync(page.pathname)
          }
        }
      },
    },
  };
}
