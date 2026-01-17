// src/lib/MetaDescriptionUtil.ts
import { MetaObject } from "./MetaObject";

/* ---------------------------------------------------
   CONSTANTS (Updated for 2026)
--------------------------------------------------- */

type Lang = "en" | "hi" | "ar";
type Device = "desktop" | "mobile";
const PIXEL_LIMITS = {
    title: {
        desktop: 600,   // Safe full-display limit (most tools agree)
        mobile: 560,
    },
    description: {
        desktop: 920,   // Updated 2026 value from recent tools
        mobile: 680,
    },
};
/* ---------------------------------------------------
   BASIC CLEANERS
--------------------------------------------------- */

export function stripHtml(html: string): string {
    if (!html) return "";
    return html
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;| /gi, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export function removeIntroPrefix(text: string): string {
    const prefixes = [
        /^introduction[:\s-]*/i,
        /^overview[:\s-]*/i,
        /^परिचय[:\s-]*/i,
        /^भूमिका[:\s-]*/i,
        /^مقدمة[:\s-]*/i,
        /^تمهيد[:\s-]*/i,
    ];

    let cleaned = text;
    for (const p of prefixes) {
        cleaned = cleaned.replace(p, "");
    }
    return cleaned.trim();
}

/* ---------------------------------------------------
   PIXEL MEASUREMENT (SSR SAFE + LANG SENSITIVE)
--------------------------------------------------- */
function ensureMinLength(
    text: string,
    minChars = 150,
    maxChars = 155
): string {
    if (text.length >= minChars) return text;

    // Try to extend by repeating last meaningful part
    const words = text.split(" ");
    let extended = text;

    let i = 0;
    while (extended.length < minChars && i < words.length) {
        extended += " " + words[i];
        i++;
    }

    // Final safety trim
    if (extended.length > maxChars) {
        extended = extended.slice(0, maxChars);
        extended = extended.slice(0, extended.lastIndexOf(" "));
    }

    return extended.trim() + "…";
}
function measureTextWidth(text: string, font: string, lang: Lang): number {
  if (typeof document === "undefined") {
    const multiplier =
      lang === "en" ? 5.6 :
      lang === "hi" ? 5.9 :
      lang === "ar" ? 5.9 : 6.0;

    return text.length * multiplier;
  }

  const canvas =
    (measureTextWidth as any)._canvas ||
    ((measureTextWidth as any)._canvas = document.createElement("canvas"));

  const context = canvas.getContext("2d");
  if (!context) return text.length * 8;

  context.font = font;
  return context.measureText(text).width;
}
function getFont(lang: Lang, type: "title" | "description"): string {
    // 2026 consensus from multiple SERP tools & analyses:
    // - Title: Arial 18px or 20px (test 18 first; many match at 18px)
    // - Description: Arial 13px or 14px (13px often closer for desc)
    const titleSize = 18;  // Start here — bump to 20 if your measured px still too high
    const descSize = 16;

    // Use Arial as primary — matches what accurate checkers emulate (even for non-Latin)
    // This reduces width for Devanagari/Arabic significantly vs Noto
    const base = "Arial, sans-serif";

    if (lang === "hi") {
        // Optional: If you want slight Devanagari adjustment without huge inflation:
        // return `${type === "title" ? titleSize : descSize}px "Noto Sans Devanagari", ${base}`;
        // But for checker-matching: stick to Arial
        return `${type === "title" ? titleSize : descSize}px ${base}`;
    }
    if (lang === "ar") {
        return `${type === "title" ? titleSize : descSize}px ${base}`;  // Arial approximates Naskh well enough
    }
    return `${type === "title" ? titleSize : descSize}px ${base}`;
}
/* ---------------------------------------------------
   PIXEL-BASED TRIMMING (WORD SAFE)
--------------------------------------------------- */

function trimByPixel(
    text: string,
    maxPixels: number,
    font: string,
    lang: Lang
): string {
    if (!text) return "";

    // For Arabic, we use a space-based split, but ensure RTL markers aren't broken
    const words = text.split(" ");
    let result = "";

    for (const word of words) {
        const test = result ? `${result} ${word}` : word;
        if (measureTextWidth(test, font, lang) > (maxPixels - 45)) { // 20px buffer for the ellipsis
            return result.trim() + "…";
        }
        result = test;
    }

    return result;
}

/* ---------------------------------------------------
   MAIN SEO GENERATOR
--------------------------------------------------- */

export function generateSeo(
    title: string,
    htmlDescription: string,
    lang: Lang = "en",
    device: Device = "mobile" // Default to mobile for safety
): MetaObject {
    const cleanText = removeIntroPrefix(stripHtml(htmlDescription));

    const titleFont = getFont(lang, "title");
    const descFont = getFont(lang, "description");

    // Enforce mobile limits even on desktop to ensure "all-device" compatibility
    // because Google often tests different layouts.
    const titleLimit = PIXEL_LIMITS.title[device] || PIXEL_LIMITS.title.mobile;
    const descLimit = PIXEL_LIMITS.description[device] || PIXEL_LIMITS.description.mobile;

    const metaTitle = trimByPixel(
        title,
        titleLimit,
        titleFont,
        lang
    );

    const metaDescription = trimByPixel(
        cleanText,
        descLimit,
        descFont,
        lang
    );

    const meta = new MetaObject();
    meta.title = metaTitle;
    meta.metaDesc = metaDescription;
    meta.device = device;
    meta.lang = lang;
    meta.titlePixels = measureTextWidth(meta.title, titleFont, lang);
    meta.descPixels = measureTextWidth(meta.metaDesc, descFont, lang);
    // console.log('meta: ', meta)
    return meta;
}
