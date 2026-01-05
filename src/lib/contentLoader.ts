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
    const fileName = `${lang}-${slug}.json`;
    if (!isLocal) {
        try {
            const filePath = path.join(dataPath, type, fileName);
            const json = await fs.readFile(filePath, "utf-8");
            return JSON.parse(json);
        } catch {
            // file not found → fallback
        }
    } else {
        try {
            const path = `${dataPath}/data/${type}/${fileName}`;
            const res = await fetch(path);
            if (res.ok) {
                return await res.json();
            }
        } catch {
            // silent
        }
    }
}
