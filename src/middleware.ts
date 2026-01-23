import { defineMiddleware } from "astro/middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  let pathname = url.pathname;

  // Ignore static assets (.css, .js, images, sitemap, etc.)
  if (pathname.includes(".")) {
    return next();
  }

  // 1️⃣ Normalize multiple slashes → single slash
  pathname = pathname.replace(/\/{2,}/g, "/");

  // 2️⃣ Ensure trailing slash (optional, but you already want this)
  if (!pathname.endsWith("/")) {
    pathname += "/";
  }

  // 3️⃣ If normalized path differs → redirect (SEO-safe)
  if (pathname !== url.pathname) {
    url.pathname = pathname;

    return new Response(null, {
      status: 301, // permanent redirect (GOOD for SEO)
      headers: {
        Location: url.toString(),
      },
    });
  }

  return next();
});
