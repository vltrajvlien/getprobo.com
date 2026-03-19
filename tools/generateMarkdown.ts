import type { AstroIntegration } from "astro";
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, copyFileSync } from "node:fs";
import { join, dirname, relative, basename } from "node:path";

/**
 * Convert an MDX file to clean markdown by stripping frontmatter,
 * imports, and Astro/Starlight components.
 */
function mdxToMarkdown(content: string): string {
  let lines = content.split("\n");

  // Extract title from frontmatter
  let title = "";
  if (lines[0]?.trim() === "---") {
    const endIdx = lines.indexOf("---", 1);
    if (endIdx > 0) {
      const frontmatter = lines.slice(1, endIdx).join("\n");
      const titleMatch = frontmatter.match(/^title:\s*["']?(.+?)["']?\s*$/m);
      if (titleMatch) {
        title = titleMatch[1];
      }
      lines = lines.slice(endIdx + 1);
    }
  }

  let md = lines
    // Remove import statements
    .filter((line) => !line.match(/^\s*import\s+/))
    .join("\n");

  // Replace <LinkCard title="X" description="Y" href="Z" /> with markdown link
  md = md.replace(
    /<LinkCard\s+title="([^"]+)"\s+description="([^"]+)"\s+href="([^"]+)"\s*\/>/g,
    "- [$1]($3) — $2"
  );

  // Also handle different attribute order
  md = md.replace(
    /<LinkCard\s+title="([^"]+)"\s+href="([^"]+)"\s+description="([^"]+)"\s*\/>/g,
    "- [$1]($2) — $3"
  );

  // Remove <CardGrid> / </CardGrid> wrappers
  md = md.replace(/<\/?CardGrid>/g, "");

  // Remove any remaining JSX/HTML-like component tags (self-closing and open/close)
  md = md.replace(/<\/?[A-Z][a-zA-Z]*[^>]*\/?>/g, "");

  // Add title as H1
  if (title) {
    md = `# ${title}\n${md}`;
  }

  // Clean up excessive blank lines
  md = md.replace(/\n{3,}/g, "\n\n").trim() + "\n";

  return md;
}

/**
 * Recursively find all files matching an extension in a directory.
 */
function findFiles(dir: string, ext: string): string[] {
  const results: string[] = [];
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        results.push(...findFiles(fullPath, ext));
      } else if (entry.endsWith(ext)) {
        results.push(fullPath);
      }
    }
  } catch {
    // Directory doesn't exist, return empty
  }
  return results;
}

/**
 * Astro integration that generates markdown versions of all pages
 * into dist/md/ at build time.
 */
export function generateMarkdown(): AstroIntegration {
  return {
    name: "generate-markdown",
    hooks: {
      "astro:build:done": async ({ dir }) => {
        const distDir = dir.pathname;
        const mdDir = join(distDir, "md");
        const rootDir = join(dirname(new URL(import.meta.url).pathname), "..");

        // Process docs MDX files
        const docsDir = join(rootDir, "src/content/docs/docs");
        const docsFiles = findFiles(docsDir, ".mdx");
        for (const file of docsFiles) {
          const relPath = relative(docsDir, file).replace(/\.mdx$/, ".md");
          const outPath = join(mdDir, "docs", relPath);
          const content = readFileSync(file, "utf-8");
          const md = mdxToMarkdown(content);
          mkdirSync(dirname(outPath), { recursive: true });
          writeFileSync(outPath, md);
        }

        // Process blog MDX files (skip French translations)
        const blogDir = join(rootDir, "src/content/blog");
        const blogFiles = findFiles(blogDir, ".mdx").filter(
          (f) => !f.includes("/fr/")
        );
        for (const file of blogFiles) {
          const slug = basename(file, ".mdx");
          const outPath = join(mdDir, "blog", `${slug}.md`);
          const content = readFileSync(file, "utf-8");
          const md = mdxToMarkdown(content);
          mkdirSync(dirname(outPath), { recursive: true });
          writeFileSync(outPath, md);
        }

        // Process customer stories MDX files (skip French)
        const storiesDir = join(rootDir, "src/content/stories");
        const storyFiles = findFiles(storiesDir, ".mdx").filter(
          (f) => !f.includes("/fr/")
        );
        for (const file of storyFiles) {
          const slug = basename(file, ".mdx");
          const outPath = join(mdDir, "stories", `${slug}.md`);
          const content = readFileSync(file, "utf-8");
          const md = mdxToMarkdown(content);
          mkdirSync(dirname(outPath), { recursive: true });
          writeFileSync(outPath, md);
        }

        // Copy hand-written marketing page markdowns
        const marketingDir = join(rootDir, "src/content/markdown");
        try {
          const marketingFiles = findFiles(marketingDir, ".md");
          for (const file of marketingFiles) {
            const relPath = relative(marketingDir, file);
            const outPath = join(mdDir, relPath);
            mkdirSync(dirname(outPath), { recursive: true });
            copyFileSync(file, outPath);
          }
        } catch {
          // No marketing markdown directory yet
        }

        console.log(
          `[generate-markdown] Generated markdown files in ${mdDir}`
        );
      },
    },
  };
}
