
import axios, { type AxiosRequestConfig } from 'axios';
import type { ApiResponse } from './pojo/responsemodel/ApiResponse';
import { getAppConfig, loadAppConfig } from './AppConfig';
import type { FaqSchema } from './pojo/responsemodel/FaqSchema';
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
    if (appConfig.isConsole) {
      printConsole(`URL: ${uri}`);
      printConsole(`Input: ${url} -> ${JSON.stringify(reqObj)}`);
      printConsole(`Error Response: ${url} -> ${JSON.stringify(resultResponse)}`);
    }

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
      const itemUrl = baseUrl + item.slug+'/';

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
              ? creatorUrl+`author/${item.authorSlug}`
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






