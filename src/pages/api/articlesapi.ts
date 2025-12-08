import type { APIRoute } from "astro";
import { apiCalls } from "@lib/postmethodService";
import { EndPointPaths } from "@lib/EndPointPaths";
import { RequestModel } from "@lib/pojo/requestmodel/RequestModel";
import type { ArticleResponse } from "@lib/pojo/responsemodel/ArticleResponse";

export const GET: APIRoute = async ({ url }) => {
    const lang = url.searchParams.get("lang") || "en";
    const page = parseInt(url.searchParams.get("page") || "0");

    const req = new RequestModel();
    req.lang = lang;
    req.offset = page;
    req.limit = 9;
    const res = await apiCalls(req, EndPointPaths.getlatestarticle);
    if (res.status !== 0) return null;
    const articleList: Array<ArticleResponse> = res.data?.respList;
    return new Response(JSON.stringify(articleList), {
        headers: { "Content-Type": "application/json" },
    });
};
