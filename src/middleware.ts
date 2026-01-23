import { defineMiddleware } from "astro/middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  let pathname = url.pathname;

  // Ignore static assets
  if (pathname.includes(".")) {
    return next();
  }

  // 1️⃣ Normalize multiple slashes
  pathname = pathname.replace(/\/{2,}/g, "/");

  // 2️⃣ Remove trailing slash (except root)
  if (pathname.length > 1 && pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
  }

  // 3️⃣ Redirect if changed
  if (pathname !== url.pathname) {
    url.pathname = pathname;
    return Response.redirect(url.toString(), 301);
  }

  return next();
});
