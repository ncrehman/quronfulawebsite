import { EndPointPaths } from "@lib/EndPointPaths";
import { RequestModel } from "@lib/pojo/requestmodel/RequestModel";
import type { ApiResponse } from "@lib/pojo/responsemodel/ApiResponse";
import type { SiteMapData } from "@lib/pojo/responsemodel/SiteMapData";
import { apiCalls } from "@lib/postmethodService";

export async function GET() {
  /* ---------------------------------
     CONFIG
  ---------------------------------- */
  const SITE_LANGUAGE = "en";
  const PUBLICATION_NAME = "Quronfula";
  const NEWS_WINDOW_HOURS = 48;

  const now = new Date();
  const cutoffTime = new Date(
    now.getTime() - NEWS_WINDOW_HOURS * 60 * 60 * 1000
  );

  /* ---------------------------------
     FETCH NEWS DATA (SINGLE LANGUAGE)
  ---------------------------------- */
  const request = new RequestModel();
  request.lang = SITE_LANGUAGE;

  const resp: ApiResponse = await apiCalls(
    request,
    EndPointPaths.getnewssitemapdata
  );

  const items: SiteMapData[] = resp?.data?.respList || [];

  /* ---------------------------------
     FILTER: LAST 48 HOURS ONLY
  ---------------------------------- */
  const recentItems = items.filter(
    item =>
      item.lastModified &&
      new Date(item.lastModified) >= cutoffTime
  );

  /* ---------------------------------
     BUILD NEWS URLS (CANONICAL ONLY)
  ---------------------------------- */
const newsUrlsXml = recentItems
    .map(item => {
      const loc = (item.defaultUrl || item.url || "").replace(/\/$/, "").trim();
      if (!loc) return "";

      const title = (item.title || "").trim();
      if (!title) return "";

      const publicationDate = new Date(item.lastModified)
        .toISOString()
        .split("T")[0]; // YYYY-MM-DD (Google News safe)

      /* IMAGE PRIORITY: landscape → square → default */
      const images = [
        item.landScapeBanner,
        item.squareBanner,
        item.bannerImage,
      ]
        .filter(Boolean)
        .filter((v, i, a) => a.indexOf(v) === i);

      const imageXml = images
        .map(
          img => `    <image:image>
      <image:loc>${img}</image:loc>
    </image:image>`
        )
        .join("\n");

      return `  <url>
    <loc>${loc}</loc>

    <news:news>
      <news:publication>
        <news:name>${PUBLICATION_NAME}</news:name>
        <news:language>${SITE_LANGUAGE}</news:language>
      </news:publication>

      <news:publication_date>${publicationDate}</news:publication_date>
      <news:title><![CDATA[${title}]]></news:title>
    </news:news>

${imageXml}
  </url>`;
    })
    .filter(Boolean)
    .join("\n");

  /* ---------------------------------
     FINAL XML
  ---------------------------------- */
 const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${newsUrlsXml}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=UTF-8",
      "X-Robots-Tag": "index, follow",
      "Cache-Control": "public, max-age=60",
    },
  });
}
