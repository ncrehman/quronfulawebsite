import { getAppConfig } from "@lib/AppConfig";
import { EndPointPaths } from "@lib/EndPointPaths";
import { RequestModel } from "@lib/pojo/requestmodel/RequestModel";
import type { ApiResponse } from "@lib/pojo/responsemodel/ApiResponse";
import type { SiteMapData } from "@lib/pojo/responsemodel/SiteMapData";
import { apiCalls } from "@lib/postmethodService";

export async function GET({ url }) {
  // Extract optional lang param (/?lang=en)
  const lang = url.searchParams.get("lang") || "ar";
  const apiServer = await getAppConfig();
  const website = apiServer.websiteUrl.replace(/\/$/, "");

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

  /* ----------------------------
     FINAL XML
  ----------------------------- */
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <!-- Homepage -->
  <url>
    <loc>${website}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Author Page -->
  <url>
    <loc>${website}/author/motiur-rehman</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  ${dynamicUrlsXml}

</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });

}

