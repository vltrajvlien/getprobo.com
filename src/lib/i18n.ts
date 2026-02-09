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
 * Get the canonical URL for a page (self-canonical)
 */
export function getCanonicalUrl(url: URL): string {
  const baseUrl = url.origin;
  let pathname = url.pathname;
  
  // Remove trailing .html if present
  pathname = pathname.replace(/\.html$/, '');
  
  return `${baseUrl}${pathname}`;
}
