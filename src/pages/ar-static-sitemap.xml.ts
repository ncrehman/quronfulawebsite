import { staticPages } from "@lib/postmethodService";

export async function GET({ url }) {
  const website = "https://www.quronfula.com/";
  const baseDomain = website.replace(/\/$/, ""); // remove trailing slash
  const lang = '/';
  const now = new Date().toISOString();

  const STATIC_PAGES = staticPages();

  const urlsXml = STATIC_PAGES
    .map(item => {

      return `
  <url>
    <loc>${baseDomain + lang}${item.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${item.changeFreq || "weekly"}</changefreq>
    <priority>${item.priority || "0.8"}</priority>
  </url>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
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
