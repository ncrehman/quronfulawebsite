import { EndPointPaths } from "@lib/EndPointPaths";
import { RequestModel } from "@lib/pojo/requestmodel/RequestModel";
import type { ApiResponse } from "@lib/pojo/responsemodel/ApiResponse";
import type { SiteMapData } from "@lib/pojo/responsemodel/SiteMapData";
import { apiCalls } from "@lib/postmethodService";

export async function GET() {
  /* ---------------------------------
     FETCH DYNAMIC SITEMAP DATA (AR)
  ---------------------------------- */
  const request = new RequestModel();
  request.lang = "en";
  request.extraVariable = "normal";

  const resp: ApiResponse = await apiCalls(
    request,
    EndPointPaths.getsitemapdata
  );

  const items: SiteMapData[] = resp?.data?.respList || [];

  /* ---------------------------------
     BUILD URL XML
  ---------------------------------- */
  const urlsXml = items
    .map(item => {
      const lastmod = new Date(item.lastModified).toISOString();

      return `
  <url>
    <loc>${item.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${item.changeFreq || "weekly"}</changefreq>
    <priority>${item.priority || "0.8"}</priority>
    ${
      item.bannerImage
        ? `
    <image:image>
      <image:loc>${item.bannerImage}</image:loc>
      <image:title><![CDATA[${item.title}]]></image:title>
    </image:image>`
        : ""
    }
  </url>`;
    })
    .join("");

  /* ---------------------------------
     FINAL XML
  ---------------------------------- */
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">


${urlsXml}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=UTF-8",
      "X-Robots-Tag": "index, follow",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
