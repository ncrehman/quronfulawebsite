export async function GET() {
  const now = new Date().toISOString().split("T")[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
 <sitemap>
    <loc>https://www.quronfula.com/en-static-sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://www.quronfula.com/ar-static-sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://www.quronfula.com/en-sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://www.quronfula.com/en-news-sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://www.quronfula.com/ar-news-sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>

  <sitemap>
    <loc>https://www.quronfula.com/ar-sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
 

</sitemapindex>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=UTF-8",
      "X-Robots-Tag": "index, follow",
      "Cache-Control": "public, max-age=3600",
    },
  });
}