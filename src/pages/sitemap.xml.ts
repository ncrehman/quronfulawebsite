import { getAppConfig } from "@lib/AppConfig";
import { EndPointPaths } from "@lib/EndPointPaths";
import { RequestModel } from "@lib/pojo/requestmodel/RequestModel";
import { apiCalls } from "@lib/postmethodService";

export async function GET({ url }) {
  // Extract optional lang param (/?lang=en)
  const lang = url.searchParams.get("lang") || "ar";
console.log('LLLLLLLLLLLL: '+lang)
const apiServer = getAppConfig();

  const baseUrl =
    lang && lang !== "ar"
      ? `${apiServer.websiteUrl}${lang}/`
      : apiServer.websiteUrl;

  const request = new RequestModel();
  request.lang = lang;

  // Call API to fetch dynamic sitemap items
  const resp = await apiCalls(request, EndPointPaths.generateallsitemap);
  const items = resp?.data?.respList || [];

  const website = "https://www.quronfula.com";

  // -------------------------------
  // Build Static Tool URLs
  // -------------------------------

  // -------------------------------
  // Build Dynamic URLs
  // -------------------------------
  const dynamicUrls = items
    .filter((item) => item.url)
    .map(
      (item) => `
  <url>
    <loc>${item.url.replace(/\/$/, "")}</loc>
    <lastmod>${new Date(item.lastModified).toISOString()}</lastmod>
    <changefreq>${item.changeFreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
    )
    .join("\n");

  // -------------------------------
  // Create Final XML Document
  // -------------------------------
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
  xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <url>
    <loc>${baseUrl}author/motiur-rehman</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  ${dynamicUrls}

</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=UTF-8",
      "X-Robots-Tag": "index, follow",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

