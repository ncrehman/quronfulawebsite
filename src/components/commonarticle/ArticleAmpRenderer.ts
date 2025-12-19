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
import { apiCalls, checkSupportedLang, generateFAQJsonLd } from "@lib/postmethodService";
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

  let faqSchema= null;

  if (article?.faqSchema?.length) {
    faqSchema = generateFAQJsonLd(article.faqSchema);
  }
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
  });

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" }
  });
}
