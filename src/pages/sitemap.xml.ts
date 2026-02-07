export async function GET() {
  const now = new Date().toISOString().split("T")[0];
  const SITEMAPS = [
    'en-static-sitemap.xml',
    'ar-static-sitemap.xml',
    'en-news-sitemap.xml',
    'ar-news-sitemap.xml',

    'ar-article-sitemap.xml',
    'ar-categories-sitemap.xml',
    'ar-quiz-sitemap.xml',
    'ar-webstory-sitemap.xml',

    'en-article-sitemap.xml',
    'en-categories-sitemap.xml',
    'en-quiz-sitemap.xml',
    'en-webstory-sitemap.xml'
  ];

  // const baseUrl = 'http://localhost:4321/site';
  const baseUrl = 'https://www.quronfula.com/site';

const sitemapEntries = SITEMAPS
  .map(path => `
  <sitemap>
    <loc>${baseUrl}/${path}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  `)
  .join('');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
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