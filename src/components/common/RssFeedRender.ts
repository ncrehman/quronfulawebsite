// src/pages/rss.xml.ts
import { getAppConfig } from '@lib/AppConfig';
import { EndPointPaths } from '@lib/EndPointPaths';
import { RequestModel } from '@lib/pojo/requestmodel/RequestModel';
import type { ApiResponse } from '@lib/pojo/responsemodel/ApiResponse';
import { apiCalls } from '@lib/postmethodService';
import type { APIRoute } from 'astro';
export async function RssFeedRender(lang?: string, type?: string, limit?: number) {

  const apiServer = await getAppConfig();
  const baseUrl = apiServer.websiteUrl.replace(/\/$/, '');
  const request = new RequestModel();
  request.lang = lang;
  request.limit = limit;
  request.offset = 0;
  request.extraVariable = type;

  const apiResponse: ApiResponse = await apiCalls(request, EndPointPaths.generaterssfeed);

  let rssXml: any;
  if (apiResponse.status === 0) {
    rssXml = apiResponse.data;
  } else {
    rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Quronfula</title>
    <link>${baseUrl}</link>
    <description>Latest stories from Quronfula</description>
    <language>${lang}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  </channel>
</rss>`;
  }

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=600',
      'X-Robots-Tag': 'index, follow',
    },
  });
}
