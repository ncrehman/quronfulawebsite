import fs from "fs";
import path from "path";
import Handlebars from "handlebars/dist/handlebars.js";
import { metaConfig } from "@components/metaConfig";
import { EndPointPaths } from "@lib/EndPointPaths";
import { RequestModel } from "@lib/pojo/requestmodel/RequestModel";
import type { ApiResponse } from "@lib/pojo/responsemodel/ApiResponse";
import type { ArticleResponse } from "@lib/pojo/responsemodel/ArticleResponse";
import type { FeedContentResponse } from "@lib/pojo/responsemodel/FeedContentResponse";
import type { ResponseModel } from "@lib/pojo/responsemodel/ResponseModel";
import { apiCalls, buildLangUrl, checkSupportedLang, cleanHtmlString, convertIframeToAmpIframe, generateFAQJsonLd, getLangPrefix, insertAdsBetweenBlocks, splitHtmlIntoBlocks } from "@lib/postmethodService";
import { getAppConfig } from "@lib/AppConfig";
import { generateSeo } from "@lib/MetaDescriptionUtil";
import type { MetaObject } from "@lib/MetaObject";

Handlebars.registerHelper("eq", function (a, b) {
  return a === b;
});

Handlebars.registerHelper("neq", function (a, b) {
  return a !== b;
});
Handlebars.registerHelper("and", function (a, b) {
  return a !== b;
});

async function fetchRelatedData(lang: string, articleId: string): Promise<Array<ArticleResponse> | null> {

  try {

    const request = new RequestModel();
    request.lang = lang;
    request.extraVariable = articleId;
    request.offset = 0;
    request.limit = 6;
    const responseResult: ApiResponse = await apiCalls(request, EndPointPaths.getrelatedarticles);
    if (responseResult.status === 0) {
      const response: ResponseModel = responseResult.data;
      if (response.statusCode === 0) {
        const article: Array<ArticleResponse> = response.respList;
        return article;
      }
    }
  } catch (err) {
    console.error('Error fetching related articles:', err);
  }

  return null;
}
export interface ArticleAmpRendererProps {
  article: FeedContentResponse;
  lang?: string;
}

export default async function ArticleAmpRenderer({ article, lang }: ArticleAmpRendererProps) {
  const relatedArticle: Array<ArticleResponse> = await fetchRelatedData(lang, article.id);
  const apiServer = await getAppConfig();
  lang = await checkSupportedLang(lang);
  const baseUrl = await buildLangUrl(lang);
  const langPrefix = await getLangPrefix(lang);
  let cleanHtml = cleanHtmlString(article.description);
  cleanHtml = convertIframeToAmpIframe(cleanHtml);
  let metaObj: MetaObject = generateSeo(article.title,
    cleanHtml)
  const canonicalUrl = `${baseUrl}article/${article.slug}`.replace(/\/$/, "");
  const ampUrl = `${canonicalUrl}/amp`;
  const siteName = metaConfig.siteName[lang];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": canonicalUrl + '#article',
    "inLanguage": lang,
    headline: article.title,
    description: metaObj.metaDesc,
    image: [article.landScapeBanner],
    datePublished: new Date(article.publishDate).toISOString(),
    dateModified: new Date(article.updatedAt || article.publishDate).toISOString(),
    author: {
      "@type": "Person",
      name: article.author_name,
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      logo: {
        "@type": "ImageObject",
        url: `${apiServer.websiteUrl}icons/android-icon-192x192.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    isPartOf: {
      "@type": "WebSite",
      "@id": apiServer.websiteUrl + "#website"
    }
  };

  let faqSchema = null;

  if (article?.faqSchema?.length) {
    faqSchema = generateFAQJsonLd(article.faqSchema);
  }

  // const website = apiServer.websiteUrl.replace(/\/$/, "");
  // const alternatesLanguages = {
  //   ar: `${website}/article/${article.slug}`,
  //   en: `${website}/en/article/${article.slug}`,
  //   "x-default": `${website}/article/${article.slug}`,
  // };
  // const alternatesLanguagesAMP = Object.fromEntries(
  //   Object.entries(alternatesLanguages).map(([lang, url]) => [lang, `${url}`])
  // );


  function getOgImageType(url = "") {
    const cleanUrl = url.split("?")[0].toLowerCase();

    if (cleanUrl.endsWith(".webp") || cleanUrl.endsWith(".jpeg"))
      return "image/jpeg";
    if (cleanUrl.endsWith(".png")) return "image/png";
    if (cleanUrl.endsWith(".webp")) return "image/webp";
    if (cleanUrl.endsWith(".gif")) return "image/gif";
    return "image/jpeg";
  }
  let ogImages = [
    {
      url: article.landScapeBanner,
      width: 1200,
      height: 630,
      imageAlt: article.imageAlt,
      type: getOgImageType(article.landScapeBanner),
    },
    {
      url: article.bannerImage,
      width: 720,
      height: 1280,
      imageAlt: article.imageAlt,
      type: getOgImageType(article.bannerImage),
    },
    {
      url: article.squareBanner,
      width: 720,
      height: 720,
      imageAlt: article.imageAlt,
      type: getOgImageType(article.squareBanner),
    },
  ].filter(img => img.url);

  let keywords = article.keywords
    ? article.keywords.split(/[,\u060C\uFF0C]/).map(k => k.trim()).filter(Boolean) : [];
  keywords.push(article.cat_name);
  keywords.push(article.sub_catTitle);

  const blocks = splitHtmlIntoBlocks(cleanHtml);
  const blocksWithAds = insertAdsBetweenBlocks(blocks, 2);



  function renderAmpBlocks(blocksWithAds: any[]): string {
    let html = '';

    for (const block of blocksWithAds) {
      if (block.type === 'content') {
        html += `
        <div class="content-block">
          ${block.html}
        </div>
      `;
      }

      if (block.type === 'ad') {
        html += renderAmpAd(block.slot);
      }
    }

    return html;
  }
  function renderAmpAd(slot: string): string {
    return `
    <div class="amp-ad-wrapper">
      <amp-ad
        width="100vw"
        height="320"
        type="adsense"
        data-ad-client="ca-pub-4100521225351324"
        data-ad-slot="${slot}"
        data-auto-format="rspv"
        data-full-width>
        <div overflow></div>
      </amp-ad>
    </div>
  `;
  }
  const ampContentHtml = renderAmpBlocks(blocksWithAds);

  const templatePath = path.join(
    process.cwd(),
    "src/components/commonarticle/article.html"
  );

  const templateSource = fs.readFileSync(templatePath, "utf-8");
  const template = Handlebars.compile(templateSource);
  const html = template({
    lang,
    dir: lang === 'ar' ? 'rtl' : 'ltr',
    title: article.title,
    metaTitle: metaObj.title || article.title,
    metaDescription: metaObj.metaDesc,
    canonicalUrl,
    ampUrl,
    contentHtml: ampContentHtml, // already sanitized HTML
    featuredImage: article.landScapeBanner,
    relatedArticles: relatedArticle,
    jsonLd: jsonLd ? JSON.stringify(jsonLd) : undefined,
    faqJsonLD: faqSchema ? JSON.stringify(faqSchema) : undefined,
    langPrefix: langPrefix,
    // hrefData: alternatesLanguagesAMP,
    author: article.author_name,
    updatedTime: new Date(article.updatedAt).toISOString(),
    publishedTime: new Date(article.publishDate).toISOString(),
    modified_time: new Date(article.updatedAt).toISOString(),
    section: article.sub_catTitle,
    keywords: keywords,
    ogImages: ogImages,
    readingTime: article.readingTime,
    locale: lang === "ar" ? "ar_AR" : "en_US",
    alternate: lang === "ar" ? "en_US" : "ar_AR",
    siteName: siteName,
  });

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" }
  });
}
