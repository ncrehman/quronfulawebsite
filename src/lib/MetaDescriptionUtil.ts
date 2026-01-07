// src/lib/MetaDescriptionUtil.ts

import { MetaObject } from "./MetaObject"


/**
 * Removes HTML tags safely
 */
export function stripHtml(html: string): string {
    if (!html) return ''
    return html
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

/**
 * Removes common intro words (multilingual)
 */
export function removeIntroPrefix(text: string): string {
    const prefixes = [
        /^introduction[:\s-]*/i,
        /^overview[:\s-]*/i,
        /^परिचय[:\s-]*/i,
        /^भूमिका[:\s-]*/i,
        /^مقدمة[:\s-]*/i,
        /^تمهيد[:\s-]*/i,
        /^présentation[:\s-]*/i
    ]

    let cleaned = text
    prefixes.forEach((p) => {
        cleaned = cleaned.replace(p, '')
    })

    return cleaned.trim()
}

/**
 * Trims text safely to a character limit
 * without cutting words
 */
export function trimToWordBoundary(
    text: string,
    limit = 155
): string {
    if (text.length <= limit) return text

    const trimmed = text.slice(0, limit)
    const lastSpace = trimmed.lastIndexOf(' ')

    return trimmed.slice(0, lastSpace).trim() + '…'
}

/**
 * Generate SEO meta from title + HTML description
 */
export function generateSeo(
    title: string,
    htmlDescription: string,
    limit = 155
): MetaObject {
    const text = stripHtml(htmlDescription)
    const cleaned = removeIntroPrefix(text)
    cleaned.replace(/&nbsp;/gi, ' ')
    cleaned.replace(/&#160;/g, ' ')
    const metaDescription = trimToWordBoundary(cleaned, limit)
    const meta: MetaObject = new MetaObject();
    meta.title = title;
    meta.metaDesc = metaDescription;
    return meta;
}
