import { EndPointPaths } from "@lib/EndPointPaths";
import { RequestModel } from "@lib/pojo/requestmodel/RequestModel";
import type { ApiResponse } from "@lib/pojo/responsemodel/ApiResponse";
import type { SiteMapData } from "@lib/pojo/responsemodel/SiteMapData";
import { apiCalls } from "@lib/postmethodService";

export async function GET({ url }) {
  /* ---------------------------------
     CONFIG
  ---------------------------------- */
  const website = "https://www.quronfula.com/";
  const baseDomain = website.replace(/\/$/, ""); // remove trailing slash

  const LANGUAGES = ["en", "ar"] as const;
  const DEFAULT_LANG = "ar";

  const lang = url.searchParams.get("lang") || DEFAULT_LANG;
  const now = new Date().toISOString();

  /* ---------------------------------
     URL BUILDER (NO TRAILING SLASH)
  ---------------------------------- */
  const buildUrl = (lang: string, path = ""): string => {
    const cleanPath = path.replace(/^\/|\/$/g, ""); // remove leading/trailing slashes

    if (!cleanPath) {
      return lang === DEFAULT_LANG
        ? baseDomain
        : `${baseDomain}/${lang}`;
    }

    return lang === DEFAULT_LANG
      ? `${baseDomain}/${cleanPath}`
      : `${baseDomain}/${lang}/${cleanPath}`;
  };

  /* ---------------------------------
     FETCH DYNAMIC SITEMAP DATA
  ---------------------------------- */
  const request = new RequestModel();
  request.lang = lang;

  const resp: ApiResponse = await apiCalls(
    request,
    EndPointPaths.generatesitemap
  );

  const items: SiteMapData[] = resp?.data?.respList || [];

  /* ---------------------------------
     STATIC ROOT PAGES
  ---------------------------------- */
  const STATIC_PAGES = [
    { path: "", changefreq: "daily", priority: "1.0" },
    { path: "about", changefreq: "daily", priority: "0.9" },
    { path: "stories", changefreq: "daily", priority: "0.9" },
    { path: "quiz", changefreq: "daily", priority: "0.9" },
    { path: "category", changefreq: "daily", priority: "0.9" },
    { path: "article", changefreq: "daily", priority: "0.9" },
    { path: "contact", changefreq: "daily", priority: "0.9" },
    { path: "privacy-policy", changefreq: "daily", priority: "0.9" },
    { path: "terms-and-conditions", changefreq: "daily", priority: "0.9" },
    { path: "disclaimer", changefreq: "daily", priority: "0.9" },
    { path: "correction-policy", changefreq: "daily", priority: "0.9" },
    { path: "code-of-ethics", changefreq: "daily", priority: "0.9" },
    { path: "fact-checking-policy", changefreq: "daily", priority: "0.9" },
    { path: "author/anjar-ahsan", changefreq: "weekly", priority: "0.6" },
  ];
const staticPagesXml = STATIC_PAGES.flatMap(page =>
  LANGUAGES.map(l => {
    const loc = buildUrl(l, page.path);

    const hreflangs = LANGUAGES.map(
      x => `    <xhtml:link rel="alternate" hreflang="${x}" href="${buildUrl(x, page.path)}" />`
    ).join("\n");

    return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
${hreflangs}
  </url>`;
  })
).join("");

  /* ---------------------------------
     DYNAMIC MULTI-LANGUAGE CONTENT
  ---------------------------------- */
  const dynamicUrlsXml = items
    .flatMap(item =>
      item.hrefLangs
        .filter(h => h.lang !== "x-default")
        .map(h => {
          const lastmod = new Date(item.lastModified).toISOString();

          const links = item.hrefLangs
            .map(
              x => `    <xhtml:link rel="alternate" hreflang="${x.lang}" href="${x.url.replace(/\/$/, "")}" />`
            )
            .join("\n");

          return `
  <url>
    <loc>${h.url.replace(/\/$/, "")}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${item.changeFreq || "weekly"}</changefreq>
    <priority>${item.priority || "0.8"}</priority>
${links}
  </url>`;
        })
    )
    .join("");

  /* ---------------------------------
     FINAL XML
  ---------------------------------- */
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">

${staticPagesXml}
${dynamicUrlsXml}

</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=UTF-8",
      "X-Robots-Tag": "index, follow",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
