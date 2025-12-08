// src/lib/content.ts

import { EndPointPaths } from "./EndPointPaths";
import { RequestModel } from "./pojo/requestmodel/RequestModel";
import type { ApiResponse } from "./pojo/responsemodel/ApiResponse";
import type { ArticleResponse } from "./pojo/responsemodel/ArticleResponse";
import type { ResponseModel } from "./pojo/responsemodel/ResponseModel";
import { apiCalls } from "./postmethodService";

const API_BASE = process.env.CONTENT_API_BASE || "https://api.yourbackend.com";

async function fetchJSON<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    return res.json();
}

// export async function getArticle(slug: string, lang: "ar" | "en"): Promise<Article | null> {
//     const url = `${API_BASE}/articles/${encodeURIComponent(slug)}?lang=${lang}`;
//     try {
//         return await fetchJSON<ArticleResponse>(url);
//     } catch (e) {
//         console.error(e);
//         return null;
//     }
// }

export async function getLatestArticle(
    language: string,
    offset: number,
): Promise<ArticleResponse[] | null> {
    const request = new RequestModel();
    request.lang = language;
    request.offset = offset;
    request.limit = 10;
    try {
        const response: ApiResponse = await apiCalls(
            request,
            EndPointPaths.getlatestarticle,
        );
        if (response.status !== 0) return null;
        const resp: ResponseModel = response.data;
        return resp.statusCode === 0 ? resp.respList : null;
    } catch (error) {
        console.error("Error fetching categories:", error);
        return null;
    }
}


