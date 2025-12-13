
import axios, { type AxiosRequestConfig } from 'axios';
import { ApiResponse } from './pojo/responsemodel/ApiResponse';
import { getAppConfig, loadAppConfig } from './AppConfig';
import { FaqSchema } from './pojo/responsemodel/FaqSchema';
import he from 'he';
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

export function cleanHtmlString(input: string) {
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
    .replace(/[\u00AD]/g, "")      // soft hyphen
    .replace(/[\u200B]/g, "")      // zero-width space
    .replace(/[\u200C]/g, "")      // ZWNJ
    .replace(/[\u200D]/g, "")      // ZWJ
    .replace(/[\uFEFF]/g, "")
    .replace(/[\u200B\u200C\u200D\uFEFF]/g, "") // zero-width characters
    .replace(/\u00AD/g, "")                    // soft hyphens
    .replace(/\r?\n|\r/g, " ")                 // CR/LF breaks
    .replace(/ +/g, " ")
    .replace(/[\u200E\u200F\u202A\u202B\u202C\u202D\u202E]/g, "")
    .replace(/ﻟ/g, "ل")
    .replace(/ﻻ/g, "لا")
    .replace(/ﺍ/g, "ا")
    .replace(/ﺃ/g, "أ")
    .replace(/ﺇ/g, "إ")
    .replace(/ﺁ/g, "آ")
    .replace(/(.)\1{2,}/g, "$1$1")
    .replace(/(\S)\s+(\S)/g, "$1 $2")                 // double spaces
    // === Normalize images ===
    .replace(/<img([^>]+)>/g, (match, attrs) => {
      if (!/alt=/.test(attrs)) attrs += ' alt=""';
      if (!/loading=/.test(attrs)) attrs += ' loading="lazy"';
      return `<img ${attrs} style="max-width:100%;height:auto;" />`;
    });


  // 🌟 ADD EXTRA SPACE BEFORE HEADING PARAGRAPHS (final fix)
  cleanedHtml = cleanedHtml.replace(
    /(<p[^>]*>[^<]*<\/p>)\s*(<p[^>]*>\s*<(strong|b)>[^<]+<\/(strong|b)>\s*<\/p>)/gi,
    `$1<br/><br/>$2`
  );

  // Remove extra line breaks after inserting
  cleanedHtml = cleanedHtml
    .replace(/(<br\/?>\s*){3,}/g, '<br/><br/>')
    .replace(/\s{2,}/g, ' ')
    .replace(/(\n|\r){2,}/g, '\n');
  // Add spacing BEFORE paragraph headings (p → p<strong>)
  cleanedHtml = cleanedHtml.replace(
    /(<\/p>)\s*(<p[^>]*>\s*<(strong|b|em)[^>]*>[^<]+<\/(strong|b|em)>\s*<\/p>)/gi,
    `$1<br/><br/>$2`
  );
  // === Style Mapping To Tailwind ===
  const styleToTailwindMap = [
    { regex: /style="text-decoration:underline;"/g, replacement: 'class="underline"' },
    { regex: /style="font-weight:bold;"/g, replacement: 'class="font-bold"' },
    { regex: /style="text-align:justify;"/g, replacement: 'class="text-justify"' },
  ];
  styleToTailwindMap.forEach(({ regex, replacement }) => {
    cleanedHtml = cleanedHtml.replace(regex, replacement);
  });
  // 🌟 NEW: Limit <strong> tags
  const MAX_STRONG = 18;
  let strongCount = 0;
  cleanedHtml = cleanedHtml.replace(/<strong>(.*?)<\/strong>/gi, (match, content) => {
    strongCount++;
    if (strongCount <= MAX_STRONG) {
      return `<strong>${content}</strong>`;
    } else {
      return `<span class="font-bold">${content}</span>`;
    }
  });

  return he.decode(cleanedHtml);
}






