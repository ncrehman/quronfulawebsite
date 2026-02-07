import { SitemapRender } from "./SitemapRender";
export async function GET() {
  return SitemapRender('ar', 'category');
}
