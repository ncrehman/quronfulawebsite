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
import { apiCalls, checkSupportedLang, generateFAQJsonLd, getLangPrefix } from "@lib/postmethodService";
import { getAppConfig } from "@lib/AppConfig";


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
  lang = checkSupportedLang(lang);
  const baseUrl =
    lang === 'ar'
      ? apiServer.websiteUrl
      : `${apiServer.websiteUrl}${lang}/`;
  const langPrefix = getLangPrefix(lang);
  const canonicalUrl = `${baseUrl}article/${article.slug}`.replace(/\/$/, "");
  const ampUrl = `${canonicalUrl}/amp`;
  const siteName = metaConfig.siteName[lang];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": canonicalUrl + '#article',
    "inLanguage": lang,
    headline: article.title,
    description: article.metaDescription,
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
    metaTitle: article.metaTitle || article.title,
    metaDescription: article.metaDescription,
    canonicalUrl,
    ampUrl,
    contentHtml: article.description, // already sanitized HTML
    featuredImage: article.landScapeBanner,
    relatedArticles: relatedArticle,
    jsonLd: JSON.stringify(jsonLd),
    faqJsonLD: JSON.stringify(faqSchema),
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
