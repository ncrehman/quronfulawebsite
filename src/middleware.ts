import { defineMiddleware } from "astro/middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const url = context.url;
  const pathname = url.pathname;

  // Ignore files like .css, .js, .png, .xml, etc.
  if (pathname.includes(".")) {
    return next();
  }
  // If missing trailing slash → internally rewrite
  if (!pathname.endsWith("/")) {
    url.pathname = pathname + "/";
    return next(url); // INTERNAL rewrite → 200 OK
  }

  return next();
});
