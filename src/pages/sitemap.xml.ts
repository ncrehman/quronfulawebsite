import { getAppConfig } from "@lib/AppConfig";
import { EndPointPaths } from "@lib/EndPointPaths";
import { RequestModel } from "@lib/pojo/requestmodel/RequestModel";
import type { SiteMapData } from "@lib/pojo/responsemodel/SiteMapData";
import { apiCalls } from "@lib/postmethodService";

export async function GET({ url }) {
  // Extract optional lang param (/?lang=en)
  const lang = url.searchParams.get("lang") || "ar";
  const apiServer = getAppConfig();

 

  const request = new RequestModel();
  request.lang = lang;

  // Call API to fetch dynamic sitemap items
  const resp = await apiCalls(request, EndPointPaths.generatesitemap);
  const items: Array<SiteMapData> = resp?.data?.respList || [];


  // Build ALL URLs - each item gives us both Arabic + English
  const allUrlEntries = items.flatMap((item: any) => {
  const lastmod = new Date(item.lastModified).toISOString();

  return item.hrefLangs
    .filter(h => h.lang !== "x-default")
    .map(h => ({
      loc: h.url.replace(/\/$/, ""),
      lastmod,
      changefreq: item.changeFreq || "weekly",
      priority: item.priority || "0.8",
      hreflangs: item.hrefLangs.map(x => ({
        lang: x.lang,
        url: x.url.replace(/\/$/, "")
      }))
    }));
});

  const dynamicUrls = allUrlEntries
    .map(entry => {
      const links = entry.hreflangs
        .map(h => `    <xhtml:link rel="alternate" hreflang="${h.lang}" href="${h.url}" />`)
        .join("\n");

      return `
  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
${links}
  </url>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://www.quronfula.com/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${dynamicUrls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });

}

