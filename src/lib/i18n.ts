import { getRelativeLocaleUrl } from "astro:i18n";
import FR from "../locales/fr.json";

const translations = new Map<string, Map<string, string>>([
  ["fr", new Map(Object.entries(FR))],
]);

export async function getTranslator(lang: string = 'en') {
  if (lang === 'en') {
    return (s:string) => s
  }
  if (!translations.has(lang)) {
    throw new Error(`Cannot find translations for ${lang}`);
  }
  return (s:string) => {
    return translations.get(lang)?.get(s) ?? s
  };
}

export function getLink (astro: {currentLocale?: string}, path: string) {
  if (path === '/' && astro.currentLocale !== 'en') {
    return `/${astro.currentLocale}`
  }
  return astro.currentLocale ? getRelativeLocaleUrl(astro.currentLocale, path) : path
}

export const filterLang =
  (lang: string = "en") =>
  (entry: { id: string }) => {
    if (lang === "en") {
      return !entry.id.includes("/");
    }
    return entry.id.startsWith(lang);
  };

/**
 * Get the canonical URL for a page, always pointing to the English version for blog posts
 */
export function getCanonicalUrl(url: URL): string {
  const baseUrl = url.origin;
  let pathname = url.pathname;
  
  // Remove trailing .html if present
  pathname = pathname.replace(/\.html$/, '');
  
  // For blog pages, always return the English version as canonical
  if (pathname.includes('/blog')) {
    // Remove language prefix if present (e.g., /fr/blog -> /blog)
    pathname = pathname.replace(/^\/[a-z]{2}\//, '/');
  }
  
  return `${baseUrl}${pathname}`;
}
