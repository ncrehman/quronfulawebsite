import { getAppConfig } from "@lib/AppConfig";
import { EndPointPaths } from "@lib/EndPointPaths";
import { RequestModel } from "@lib/pojo/requestmodel/RequestModel";
import type { ApiResponse } from "@lib/pojo/responsemodel/ApiResponse";
import type { SiteMapData } from "@lib/pojo/responsemodel/SiteMapData";
import { apiCalls } from "@lib/postmethodService";

export async function GET({ url }) {
  // Extract optional lang param (/?lang=en)
  const lang = url.searchParams.get("lang") || "ar";
  const website = 'https://www.quronfula.com/';
  const LANGUAGES = ["en", "ar"] as const;
  const DEFAULT_LANG = "ar";
  const baseDomain = website.replace(/\/$/, "");
  /* ---------------------------------
     URL BUILDER
  ---------------------------------- */
  const buildUrl = (lang: string, path = "") => {
    if (lang === DEFAULT_LANG) {
      return `${baseDomain}/${path}`.replace(/\/$/, "");
    }
    return `${baseDomain}/${lang}/${path}`.replace(/\/$/, "");
  };
  /* ----------------------------
     FETCH DYNAMIC SITEMAP DATA
  ----------------------------- */
  const request = new RequestModel();
  request.lang = lang; // language-agnostic sitemap

  const resp: ApiResponse = await apiCalls(
    request,
    EndPointPaths.generatesitemap
  );

  const items: SiteMapData[] = resp?.data?.respList || [];

  /* ----------------------------
     DYNAMIC MULTI-LANGUAGE PAGES
  ----------------------------- */
  const dynamicUrlsXml = items
    .flatMap(item => {
      const lastmod = new Date(item.lastModified).toISOString();

      return item.hrefLangs
        .filter(h => h.lang !== "x-default")
        .map(h => {
          const links = item.hrefLangs
            .map(
              x =>
                `    <xhtml:link rel="alternate" hreflang="${x.lang}" href="${x.url.replace(
                  /\/$/,
                  ""
                )}" />`
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
        });
    })
    .join("");


    
  /* ---------------------------------
     STATIC ROOT PAGES
  ---------------------------------- */
  const STATIC_PAGES = [
    {
      path: "",
      changefreq: "daily",
      priority: "1.0",
    },
    {
      path: "about",
      changefreq: "daily",
      priority: "0.9",
    },
    {
      path: "stories",
      changefreq: "daily",
      priority: "0.9",
    },
    {
      path: "quiz",
      changefreq: "daily",
      priority: "0.9",
    },
    {
      path: "category",
      changefreq: "daily",
      priority: "0.9",
    },
    {
      path: "aticle",
      changefreq: "daily",
      priority: "0.9",
    },
    {
      path: "contact",
      changefreq: "daily",
      priority: "0.9",
    },
    {
      path: "privacy-policy",
      changefreq: "daily",
      priority: "0.9",
    },
    {
      path: "terms-and-conditions",
      changefreq: "daily",
      priority: "0.9",
    },

    {
      path: "author/motiur-rehman",
      changefreq: "weekly",
      priority: "0.6",
    },
  ];

  const now = new Date().toISOString();

  const staticPagesXml = STATIC_PAGES.flatMap(page =>
    LANGUAGES.map(lang => {
      const loc = buildUrl(lang, page.path);

      const hreflangs = LANGUAGES.map(
        l =>
          `    <xhtml:link rel="alternate" hreflang="${l}" href="${buildUrl(
            l,
            page.path
          )}" />`
      ).join("\n");

      return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
${hreflangs}
    <xhtml:link rel="alternate" hreflang="x-default" href="${buildUrl(
        DEFAULT_LANG,
        page.path
      )}" />
  </url>`;
    })
  ).join("");


  
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
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });

}

