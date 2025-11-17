// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import faroUploader from "@grafana/faro-rollup-plugin";
import starlightThemeObsidian from "starlight-theme-obsidian";
import svelte from "@astrojs/svelte";
import starlight from "@astrojs/starlight";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://www.getprobo.com",
  prefetch: false,
  trailingSlash: "never",
  redirects: {
    "/blog/page/1": {
      status: 301,
      destination: "/blog",
    },
  },
  build: {
    format: "file",
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (
              id.includes("node_modules/svelte") ||
              id.includes("lib/runes") ||
              id.includes("node_modules/runed")
            ) {
              return "svelte";
            }

            if (id.includes("@splide")) {
              return "splide";
            }

            return null;
          },
        },
      },
    },
    plugins: [
      tailwindcss(),
      faroUploader({
        appName: "site",
        endpoint:
          "https://faro-collector-prod-us-west-0.grafana.net/collect/bc771c773d3690b642ccf001af91958a",
        apiKey: "",
        appId: "",
        stackId: "",
        gzipContents: true,
      }),
    ],
  },

  integrations: [
    starlight({
      plugins: [
        starlightThemeObsidian({
          backlinks: false,
          graph: false,
        }),
      ],
      disable404Route: true,
      title: "Probo Documentation",
      logo: {
        replacesTitle: true,
        src: "./src/assets/probo-logo.svg",
        alt: "Probo Logo",
      },
      defaultLocale: "root",
      locales: {
        root: {
          label: "English",
          lang: "en",
        },
      },
      customCss: ["./src/styles/starlight.css"],
      lastUpdated: true,
      editLink: {
        baseUrl:
          "https://github.com/getprobo/getprobo.com/edit/main/src/content/docs/",
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/getprobo/probo",
        },
        {
          icon: "discord",
          label: "Discord",
          href: "https://discord.com/invite/8qfdJYfvpY",
        },
      ],
      sidebar: [
        {
          label: "Getting Started",
          items: [{ label: "Overview", slug: "docs" }],
        },
        {
          label: "Self-Hosting",
          items: [
            {
              label: "Docker Compose",
              slug: "docs/self-hosting/docker-compose",
            },
            { label: "Kubernetes", slug: "docs/self-hosting/kubernetes" },
          ],
        },
        {
          label: "Configuration",
          items: [
            { label: "Overview", slug: "docs/configuration/overview" },
            { label: "Config File", slug: "docs/configuration/config-file" },
            {
              label: "Environment Variables",
              slug: "docs/configuration/environment-variables",
            },
          ],
        },
        {
          label: "Product",
          items: [
            {
              label: "SSO",
              items: [
                { label: "Overview", slug: "docs/product/sso/overview" },
                {
                  label: "Google Workspace",
                  slug: "docs/product/sso/google-workspace",
                },
                { label: "Okta", slug: "docs/product/sso/okta" },
              ],
            },
          ],
        },
      ],
    }),
    mdx(),
    svelte(),
    sitemap({
      serialize(item) {
        item.lastmod = new Date().toISOString();

        if (item.url === "https://www.getprobo.com") {
          item.changefreq = /** @type {import('sitemap').EnumChangefreq} */ (
            "weekly"
          );
          item.priority = 1.0;
        } else if (item.url === "https://www.getprobo.com/docs") {
          item.changefreq = /** @type {import('sitemap').EnumChangefreq} */ (
            "weekly"
          );
          item.priority = 0.9;
        } else if (item.url.includes("/blog/")) {
          item.changefreq = /** @type {import('sitemap').EnumChangefreq} */ (
            "weekly"
          );
          item.priority = 0.8;
        } else if (
          item.url.includes("/docs/configuration") ||
          item.url.includes("/docs/self-hosting")
        ) {
          item.changefreq = /** @type {import('sitemap').EnumChangefreq} */ (
            "monthly"
          );
          item.priority = 0.8;
        } else if (item.url.includes("/docs")) {
          item.changefreq = /** @type {import('sitemap').EnumChangefreq} */ (
            "monthly"
          );
          item.priority = 0.7;
        } else if (item.url.includes("/stories")) {
          item.changefreq = /** @type {import('sitemap').EnumChangefreq} */ (
            "monthly"
          );
          item.priority = 0.7;
        } else if (item.url.includes("/about")) {
          item.changefreq = /** @type {import('sitemap').EnumChangefreq} */ (
            "monthly"
          );
          item.priority = 0.6;
        } else if (
          item.url.includes("/privacy") ||
          item.url.includes("/terms") ||
          item.url.includes("/cookie-policy") ||
          item.url.includes("/subprocessors")
        ) {
          item.changefreq = /** @type {import('sitemap').EnumChangefreq} */ (
            "yearly"
          );
          item.priority = 0.3;
        } else {
          item.changefreq = /** @type {import('sitemap').EnumChangefreq} */ (
            "monthly"
          );
          item.priority = 0.5;
        }

        return item;
      },
    }),
  ],
});
