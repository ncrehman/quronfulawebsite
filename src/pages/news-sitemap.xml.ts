import { EndPointPaths } from "@lib/EndPointPaths";
import { RequestModel } from "@lib/pojo/requestmodel/RequestModel";
import type { ApiResponse } from "@lib/pojo/responsemodel/ApiResponse";
import type { SiteMapData } from "@lib/pojo/responsemodel/SiteMapData";
import { apiCalls } from "@lib/postmethodService";

export async function GET() {
  /* ---------------------------------
     CONFIG
  ---------------------------------- */
  const DEFAULT_LANG = "en";
  const NEWS_WINDOW_HOURS = 48;
  const now = new Date();
  const cutoffTime = new Date(
    now.getTime() - NEWS_WINDOW_HOURS * 60 * 60 * 1000
  );

  /* ---------------------------------
     FETCH NEWS DATA (DEFAULT LANGUAGE ONLY)
  ---------------------------------- */
  const request = new RequestModel();
  request.lang = DEFAULT_LANG;

  const resp: ApiResponse = await apiCalls(
    request,
    EndPointPaths.generatenewssitemap
  );

  const items: SiteMapData[] = resp?.data?.respList || [];
  /* ---------------------------------
     FILTER: LAST 48 HOURS ONLY
  ---------------------------------- */
  const recentItems = items.filter(
    item => new Date(item.lastModified) >= cutoffTime
  );

  /* ---------------------------------
     BUILD NEWS URLS (Default CANONICAL ONLY)
  ---------------------------------- */
  const newsUrlsXml = recentItems
  .flatMap(item => {
    const publicationDate = new Date(item.lastModified).toISOString();

    // Safety: if hrefLangs missing, fallback to default
    const hrefLangs = item.hrefLangs?.length
      ? item.hrefLangs
      : [{
          lang: DEFAULT_LANG,
          title: item.title,
          url: item.url
        }];

    return hrefLangs.map(href => {
      const loc = href.url.replace(/\/$/, "");

      return `
  <url>
    <loc>${loc}</loc>
    <news:news>
      <news:publication>
        <news:name>Quronfula</news:name>
        <news:language>${href.lang}</news:language>
      </news:publication>
      <news:publication_date>${publicationDate}</news:publication_date>
      <news:title><![CDATA[${href.title || item.title || ""}]]></news:title>
    </news:news>
  </url>`;
    });
  })
  .join("");

  /* ---------------------------------
     FINAL XML (ALWAYS RETURN VALID XML)
  ---------------------------------- */
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
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
