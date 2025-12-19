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
const NEWS_WINDOW_HOURS = 48;
const now = new Date(); // ✅ Date object
const cutoffTime = new Date(
  now.getTime() - NEWS_WINDOW_HOURS * 60 * 60 * 1000
);

  /* ---------------------------------
     FETCH DYNAMIC SITEMAP DATA
  ---------------------------------- */
  const request = new RequestModel();
  request.lang = lang;

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
     BUILD NEWS URLS
  ---------------------------------- */
  const newsUrlsXml = recentItems
    .flatMap(item =>
      item.hrefLangs
        .filter(h => h.lang !== "x-default")
        .map(h => {
          const loc = h.url.replace(/\/$/, "");
          const publicationDate = new Date(
            item.lastModified
          ).toISOString();

          /* 🖼 IMAGE PRIORITY */
          const images = [
            item.landScapeBanner,
            item.squareBanner,
            item.bannerImage,
          ]
            .filter(Boolean)
            .filter((v, i, a) => a.indexOf(v) === i);

          const imageXml = images
            .map(
              img => `
    <image:image>
      <image:loc>${img}</image:loc>
    </image:image>`
            )
            .join("");

          return `
  <url>
    <loc>${loc}</loc>

    <news:news>
      <news:publication>
        <news:name>QuronFula</news:name>
        <news:language>${h.lang}</news:language>
      </news:publication>

      <news:publication_date>${publicationDate}</news:publication_date>
      <news:title><![CDATA[${h.title || ""}]]></news:title>
    </news:news>

${imageXml}
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
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

${newsUrlsXml}

</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=UTF-8",
      "X-Robots-Tag": "index, follow",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
    },
  });
}
