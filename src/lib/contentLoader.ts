import fs from "fs/promises";
import path from "path";

const hostName = typeof window !== "undefined" ? window.location.hostname : "localhost";
const isLocal = hostName.includes("localhost") || hostName.includes("192.168.1");
let dataPath = '';
if (isLocal) {
    dataPath = 'https://www.quronfula.com';
} else {
    dataPath = '/var/www/html/quronfula/data';
}
export async function loadContent(
    type: "article" | "quiz" | "stories" | "category" | "subcategory" | "home",
    slug: string,
    lang: string
) {
    // const fileName = `${lang}-${slug}.json`;

    // let data: any = null;

    // if (!isLocal) {
    //     try {
    //         const filePath = path.join(dataPath, type, fileName);
    //         const json = await fs.readFile(filePath, "utf-8");
    //         data = JSON.parse(json);
    //     } catch {
    //         return null;
    //     }
    // } else {
    //     try {
    //         const url = `${dataPath}/data/${type}/${fileName}`;
    //         const res = await fetch(url);
    //         if (!res.ok) return null;
    //         data = await res.json();
    //     } catch {
    //         return null;
    //     }
    // }

    // // 🔐 FINAL GUARD
    // if (!isValidContent(data, type)) {
    //     console.warn(
    //         `[loadContent] Invalid ${type} JSON: ${fileName}`
    //     );
    //     return null;
    // }

    // return data;
    return null;
}
export const REQUIRED_Article_FIELDS = [
    "id",
    "title",
    "subTitle",
    "description",
    "metaTitle",
    "metaDescription",
    "lang",
    "slug",
    "keywords",
    "readingTime",
    "bannerImage",
    "squareBanner",
    "landScapeBanner",
    "bannerImage_title",
    "squareBanner_title",
    "landScapeBanner_title",
    "image",
    "imageAlt",
    "caption",

    "sub_catId",
    "sub_catTitle",
    "sub_catBanner",
    "sub_catslug",

    "cat_name",
    "cat_id",
    "cat_slug",
    "cat_banner",

    "author_id",
    "author_name",
    "author_profile",
    "author_slug",
    "canonicalUrl",
    "faqSchema",
    "publishDate",
] as const;
function isValidContent(data: any, type: string): boolean {
    if (!data || typeof data !== "object") return false;
    if (type === 'article') {
        for (const key of REQUIRED_Article_FIELDS) {
            if (
                data[key] === null ||
                data[key] === undefined ||
                (typeof data[key] === "string" && data[key].trim() === "")
            ) {
                return false;
            }
        }
        return true;
    } else {
        return true;
    }
}