
import axios, { type AxiosRequestConfig } from 'axios';
import { ApiResponse } from './pojo/responsemodel/ApiResponse';
import { getAppConfig, loadAppConfig } from './AppConfig';
import { FaqSchema } from './pojo/responsemodel/FaqSchema';
import he from 'he';
// import { unescape } from 'he';  // Assuming you already import he for the final decode

const printConsole = async (input: any) => {
  console.log(input);
}
export async function removeDuplicate(list: Array<any>, key: string) {
  return list.filter((obj: any, pos: number, arr: Array<any>) => {
    return arr.map(mapObj => mapObj[key]).indexOf(obj[key]) === pos;
  });
}

export function getLangPrefix(language?: string): string {
  return (!language || language === 'ar') ? '' : `${language}/`;
}
export async function buildLangUrl(lang: string) {
  let appConfig = getAppConfig();
  if (!appConfig) {
    appConfig = await loadAppConfig();
  }
  const langPrefix = lang && lang !== 'ar' ? `${lang}/` : '';

  return `${appConfig.websiteUrl}${langPrefix}`;
}


export async function checkForDecode(slug: string) {
  let abc = '';
  if (slug != null) {
    // if (lang != 'en') {
    abc = decodeURIComponent(slug);
    // } else {
    //   abc = slug;
    // }
  } else {
    abc = '';
  }

  return abc;
}

export async function apiCalls(reqObj: any, url: string): Promise<ApiResponse> {
  // Ensure AppConfig is loaded

  let appConfig = getAppConfig();
  if (!appConfig) {
    appConfig = await loadAppConfig();
  }
  if (!appConfig) throw new Error("AppConfig not initialized");

  const uri = appConfig.webServicesUrl + url;
console.log('uri: '+uri)
  const options: AxiosRequestConfig = {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Accept-Language": "en",
      "Content-Language": reqObj.lang ? reqObj.lang : "en",
    },
  };

  try {
    const response = await axios.post(uri, reqObj, options);
    const resultResponse: ApiResponse = {
      status: 0,
      data: response.data,
      message: "Success",
    };

    // Logging
    // console.log("console per: "+appConfig.isConsole)
    if (appConfig.isConsole) {
      printConsole(`URL: ${uri}`);
      printConsole(`Input: ${url} -> ${JSON.stringify(reqObj)}`);
      printConsole(`Response: ${url} -> ${JSON.stringify(resultResponse)}`);
    }

    return resultResponse;

  } catch (error: any) {
    const resultResponse: ApiResponse = {
      status: 3,
      data: error?.response?.data || error.message || error,
      message: "Please try again",
    };

    // Logging
    // if (appConfig.isConsole) {
    printConsole(`URL: ${uri}`);
    printConsole(`Input: ${url} -> ${JSON.stringify(reqObj)}`);
    printConsole(`Error Response: ${url} -> ${JSON.stringify(resultResponse)}`);
    // }

    return resultResponse;
  }
}


export interface BreadcrumbItem {
  name: string;
  url: string;
}
export function generateBreadcrumb(menuName: string, menuItems: BreadcrumbItem[]) {
  if (!menuItems || menuItems.length === 0) return null;
  const items = menuItems.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url.endsWith('/') ? item.url : item.url + '/'
  }));
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": (items[items.length - 1]?.item || "") + "#breadcrumb",
    name: menuName,
    itemListElement: items
  };
}

export function generateItemList({
  name,
  description,
  baseUrl,
  listUrl,
  items = [],
  creatorName,
  creatorUrl,
}) {

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": listUrl + "#itemlist",
    "name": name,
    "description": description,
    "url": listUrl,
    "itemListOrder": "Ascending",
    "numberOfItems": items.length,

    "provider": {
      "@type": "Organization",
      "@id": creatorUrl + "#organization",
      "name": creatorName,
      "url": creatorUrl
    },

    "itemListElement": items.map((item, index) => {
      const itemUrl = baseUrl + item.slug + '/';

      return {
        "@type": "ListItem",
        "@id": `${itemUrl}#listItem`,
        "position": index + 1,
        "name": item.title,

        "item": {
          "@type": item.type || "Article",
          "@id": `${itemUrl}#${item.type.toLowerCase()}`,
          "url": itemUrl,
          "headline": item.title,
          "name": item.title,
          "image": item.image || creatorUrl + "poster.jpg",

          "author": {
            "@type": "Person",
            "@id": item.authorSlug
              ? creatorUrl + `author/${item.authorSlug}#person`
              : creatorUrl + "#defaultAuthor",
            "name": item.authorName || "Quronfula",
            "url": item.authorSlug
              ? creatorUrl + `author/${item.authorSlug}`
              : creatorUrl
          }
        }
      };
    })
  };
}

export function generateFAQJsonLd(faqs: Array<FaqSchema>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}
export function getLocalizedAmpUrl(ampUrl: string, lang: string) {
  // If amp is disabled or lang is English, return the original
  if (!ampUrl || lang === "ar") return ampUrl;

  try {
    const url = new URL(ampUrl);

    // Remove existing lang if accidentally present
    const parts = url.pathname.split("/").filter(Boolean);

    const supportedLangs = ["en", "ar"];

    // If first segment is already lang, remove it
    if (supportedLangs.includes(parts[0])) {
      parts.shift();
    }

    // Add new lang at start
    const newPath = "/" + lang + "/" + parts.join("/");

    return `${url.origin}${newPath}`;
  } catch (err) {
    console.error("Invalid AMP URL:", err);
    return null;
  }
}

export function cleanHtmlString(input: string): string {
  if (!input) return '';

  let cleanedHtml = input
    // === Your Existing Rules (unchanged) ===
    .replace(/(?<!<br\/?>)\s*(?=<p>\s*<strong>(?:(?!<\/strong>.*<strong>).)*<\/strong>\s*<\/p>)/g, '<br/>')
    .replace(/<p[^>]*>\s*<\/p>/g, '<br/>')
    .replace(/(<br\s*\/?>\s*){2,}/g, '<br/>')
    .replace(/ class="[^"]*"/g, '')
    .replace(/style="[^"]*"/g, '')
    .replace(/width="\d+"/g, 'width="100%"')
    .replace(/height="\d+"/g, '')
    .replace(/<span[^>]*>/g, '')
    .replace(/<\/span>/g, '')
    .replace(/&nbsp;/g, ' ')

    // === Fix <a> tags ===
    .replace(/<strong>\s*<a([^>]+)>(.*?)<\/a>\s*<\/strong>/g, '<a$1 class="backlink underline"><strong>$2</strong></a>')
    .replace(/<a\s+(?![^>]*style=)([^>]+)>/g, '<a class="backlink underline" $1>')
    .replace(/<a\s+([^>]*?)style="[^"]*"(.*?)>/g, '<a class="backlink underline" $1$2>')

    // === Heading Fix ===
    .replace(/<h1[^>]*>/g, '<h2>')
    .replace(/<\/h1>/g, '</h2>')
    .replace(/<h2[^>]*>/g, '<h3>')
    .replace(/<\/h2>/g, '</h3>')
    .replace(/<h3[^>]*>/g, '<h4>')
    .replace(/<\/h3>/g, '</h4>')
    .replace(/<h4[^>]*>/g, '<h5>')
    .replace(/<\/h4>/g, '</h5>')
    .replace(/<h5[^>]*>/g, '<p class="font-bold text-lg">')
    .replace(/<\/h5>/g, '</p>')
    .replace(/<h6[^>]*>/g, '<p class="font-semibold">')
    .replace(/<\/h6>/g, '</p>')

    // === Remove empty tags ===
    .replace(/<div[^>]*>\s*<\/div>/g, '')
    .replace(/<strong>\s*<\/strong>/g, '')
    .replace(/<em>\s*<\/em>/g, '')
    .replace(/<b>\s*<\/b>/g, '')
    .replace(/<i>\s*<\/i>/g, '')

    // === Remove Microsoft Word junk ===
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\?xml[^>]*>/g, '')
    .replace(/<\/?o:[^>]*>/g, '')
    .replace(/style="[^"]*(mso-|Calibri|Arial)[^"]*"/g, '')
    .replace(/[\u00AD]/g, '')                  // soft hyphen
    .replace(/[\u200B\u200C\u200D\uFEFF]/g, '') // zero-width characters
    .replace(/\r?\n|\r/g, ' ')
    .replace(/ +/g, ' ')
    .replace(/[\u200E\u200F\u202A\u202B\u202C\u202D\u202E]/g, '')
    .replace(/ﻟ/g, 'ل')
    .replace(/ﻻ/g, 'لا')
    .replace(/ﺍ/g, 'ا')
    .replace(/ﺃ/g, 'أ')
    .replace(/ﺇ/g, 'إ')
    .replace(/ﺁ/g, 'آ')
    .replace(/(.)\1{2,}/g, '$1$1')
    .replace(/(\S)\s+(\S)/g, '$1 $2')

    // === Normalize images ===
    .replace(/<img([^>]+)>/g, (match, attrs) => {
      if (!/alt=/.test(attrs)) attrs += ' alt=""';
      if (!/loading=/.test(attrs)) attrs += ' loading="lazy"';
      return `<img ${attrs} style="max-width:100%;height:auto;" />`;
    });

  // 🌟 Add spacing before heading-like paragraphs
  cleanedHtml = cleanedHtml
    .replace(/(<p[^>]*>[^<]*<\/p>)\s*(<p[^>]*>\s*<(strong|b)>[^<]+<\/\3>\s*<\/p>)/gi, '$1<br/><br/>$2')
    .replace(/(<\/p>)\s*(<p[^>]*>\s*<(strong|b|em)[^>]*>[^<]+<\/\3>\s*<\/p>)/gi, '$1<br/><br/>$2')
    .replace(/(<br\/?>\s*){3,}/g, '<br/><br/>');

  // === Style Mapping to Tailwind ===
  const styleToTailwindMap = [
    { regex: /style="text-decoration:underline;"/g, replacement: 'class="underline"' },
    { regex: /style="font-weight:bold;"/g, replacement: 'class="font-bold"' },
    { regex: /style="text-align:justify;"/g, replacement: 'class="text-justify"' },
  ];
  styleToTailwindMap.forEach(({ regex, replacement }) => {
    cleanedHtml = cleanedHtml.replace(regex, replacement);
  });

  // === COMBINED: Limit <strong> count AND convert long content to inline bold ===
  const MAX_STRONG = 18;
  const MAX_STRONG_CHARS = 70;
  let strongCount = 0;

  cleanedHtml = cleanedHtml.replace(/<strong>(.*?)<\/strong>/gis, (match, innerContent) => {
    // Compute visible plain text length
    let plainText = innerContent
      .replace(/<[^>]*>/g, '')          // Remove all tags
      .replace(/&nbsp;/gi, ' ')
      .trim();

    plainText = he.decode(plainText);    // Critical: decode entities like &amp; → &
    plainText = plainText.replace(/\s+/g, ' ');

    const isTooLong = plainText.length > MAX_STRONG_CHARS;
    strongCount++;

    // Demote to inline style if too long OR exceeds count limit
    if (isTooLong || strongCount > MAX_STRONG) {
      return `<span style="font-weight:700;">${innerContent}</span>`;
    }

    return match; // Keep as <strong>
  });

  // === Vary duplicate anchor texts (SEO best practice) ===
  const anchorMap = new Map<string, number>();

  cleanedHtml = cleanedHtml.replace(/<a([^>]*)>(.*?)<\/a>/gi, (match, attrs, originalText) => {
    let text = originalText.trim();
    if (text === '') return match;

    const key = text.toLowerCase();
    const count = (anchorMap.get(key) || 0) + 1;
    anchorMap.set(key, count);

    if (count > 1) {
      const variations = [
        `${text} (${count - 1})`,
        `${text} again`,
        `more on ${text.toLowerCase()}`,
        text + ' →',
      ];
      text = variations[(count - 2) % variations.length] || `${text} (${count - 1})`;
    }

    if (!/class=/.test(attrs)) {
      attrs += ' class="backlink underline"';
    }

    return `<a${attrs}>${text}</a>`;
  });

  return he.decode(cleanedHtml);
}






