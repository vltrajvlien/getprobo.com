/**
 * Generate i18n json files based on strings found in the sourcePath
 * - The strings will be found in functions similar to getText `__()`
 * - JSON should be updated incrementally, new string should be added at the end, and unused strings should be removed
 *
 * How it works:
 * 1. Recursively scans files matching `sourcePath` (supports ** and * wildcards, limited to extensions)
 * 2. Extracts all string literals passed as the first arg to a function named `__`
 * 3. For each language in `langs`, it updates `outputPath` by:
 *    - Keeping existing keys that are still in use, preserving their previous order
 *    - Appending newly found keys at the end (default value = source key)
 *    - Removing keys that are no longer used in source
 */

import { existsSync, globSync, readFileSync, writeFileSync } from "node:fs";

const sourcePath = "./src/**/*.{astro}";
const langs = ["fr"];
const outputPath = "./src/locales/{lang}.json";

type Dict = Map<string, string>;

/**
 * Extract strings from __('<text>') or __("<text>") or __(`text`)
 */
function extractStringsFromContent(content: string): string[] {
  const results: string[] = [];
  const regex = /__\(\s*(["'`])((?:\\.|(?!\1)[^\\])*)\1\s*\)/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(content)) !== null) {
    const raw = m[2];
    const quote = m[1];
    const value = unescapeString(raw, quote);
    if (!results.includes(value)) results.push(value);
  }
  return results;
}

function unescapeString(s: string, quote: string): string {
  // Handle common JS escapes and the specific quote type
  return s
    .replace(new RegExp("\\\\" + quote, "g"), quote) // unescape the quote
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\`/g, "`")
    .replace(/\\\\/g, "\\");
}

function readJson(file: string): Dict {
  const dict = new Map<string, string>();
  if (!existsSync(file)) {
    writeFileSync(file, "{}", "utf8");
    return dict;
  }
  const buf = readFileSync(file, "utf8");
  const obj = JSON.parse(buf) as Record<string, unknown>;
  return new Map(Object.entries(obj)) as Dict;
}

function writeJson(file: string, dict: Dict) {
  const entries = Array.from(dict.entries()).toSorted((a, b) =>
    a[0].localeCompare(b[0]),
  );
  writeFileSync(
    file,
    JSON.stringify(Object.fromEntries(entries), null, 2),
    "utf8",
  );
}

/**
 * Extract strings from all files matching the sourcePath glob pattern
 */
function collectStrings(): Set<string> {
  const files = globSync(sourcePath);
  files.sort(); // deterministic order by path
  const strings = new Set<string>();
  for (const f of files) {
    const content = readFileSync(f, "utf8");
    const found = extractStringsFromContent(content);
    for (const s of found) {
      strings.add(s);
    }
  }
  return strings;
}

const keys = collectStrings();
for (const lang of langs) {
  const outFile = outputPath.replace("{lang}", lang);
  const dict = readJson(outFile);
  const existingKeys = new Set(dict.keys());

  console.log(`# Creating ${lang} translations`);
  for (const newKey of keys.difference(existingKeys)) {
    dict.set(newKey, "");
    console.log("+ " + newKey);
  }
  for (const removedKey of existingKeys.difference(keys)) {
    dict.delete(removedKey);
    console.log("- " + removedKey);
  }
  writeJson(outFile, dict);
  console.log(`✓ done. Writing to ${outFile}`);
  console.log("");
}
