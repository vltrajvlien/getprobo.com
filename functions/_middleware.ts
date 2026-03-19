export async function onRequest(context: {
  request: Request;
  next: () => Promise<Response>;
  env: { ASSETS: { fetch: (req: Request | URL | string) => Promise<Response> } };
}): Promise<Response> {
  const accept = context.request.headers.get("Accept") || "";
  if (!accept.includes("text/markdown")) {
    return context.next();
  }

  const url = new URL(context.request.url);

  // Skip API routes and static assets
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_astro/") ||
    url.pathname.startsWith("/static/") ||
    url.pathname.match(/\.\w+$/)
  ) {
    return context.next();
  }

  const path = url.pathname === "/" ? "/index" : url.pathname;
  const mdUrl = new URL(`/md${path}.md`, url.origin);
  const response = await context.env.ASSETS.fetch(mdUrl);

  if (response.ok) {
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        Vary: "Accept",
      },
    });
  }

  return context.next();
}
