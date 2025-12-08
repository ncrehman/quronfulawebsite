import type { APIRoute } from "astro";
import { apiCalls, checkForDecode } from "@lib/postmethodService";
import { EndPointPaths } from "@lib/EndPointPaths";
import { RequestModel } from "@lib/pojo/requestmodel/RequestModel";
import type { QuizStoryResponse } from "@lib/pojo/responsemodel/QuizStoryResponse";

export const GET: APIRoute = async ({ url }) => {
    const lang = url.searchParams.get("lang") || "en";
    const page = parseInt(url.searchParams.get("page") || "0");
    const catslug = (url.searchParams.get("catslug") || null);
    const subCatSlug = (url.searchParams.get("subCatSlug") || null);

    const req = new RequestModel();
    req.lang = lang;
    req.offset = page;
    req.limit = 18;
    if (catslug) {
        req.slug = await checkForDecode(catslug);
    }
    if (subCatSlug) {
        req.extraVariable = await checkForDecode(subCatSlug);
    }
    const res = await apiCalls(req, EndPointPaths.getquizbycategoryslug);
    if (res.status !== 0) return null;
    const itemList: Array<QuizStoryResponse> = res.data?.respList;
    return new Response(JSON.stringify(itemList), {
        headers: { "Content-Type": "application/json" },
    });
};
