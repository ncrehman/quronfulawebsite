import fs from "fs";
import path from "path";
import Handlebars from "handlebars/dist/handlebars.js";
Handlebars.registerHelper("eq", function (a, b, options) {
  if (a === b) {
    return options.fn ? options.fn(this) : '';
  }
  return options.inverse ? options.inverse(this) : '';
});
import { metaConfig } from "../metaConfig";
import type { QuizStoryResponse } from "@lib/pojo/responsemodel/QuizStoryResponse";
import { getAppConfig } from "@lib/AppConfig";
import { generateBreadcrumb, generateItemList } from "@lib/postmethodService";
import type { QuizSlide } from "@lib/pojo/responsemodel/QuizSlide";
import type { QuizResultMeterResponse } from "@lib/pojo/responsemodel/QuizResultMeterResponse";

export interface QuizAmpRendererProps {
  quiz: QuizStoryResponse;
  lang?: string;
}

export default async function QuizAmpRenderer({ quiz, lang }: QuizAmpRendererProps) {
  const apiServer = await getAppConfig();
  lang = lang ?? 'ar';
  const baseUrl = lang !== "ar" ? `${apiServer.websiteUrl}${lang}/` : apiServer.websiteUrl;
  const canonicalUrl = `${baseUrl}quiz/${quiz.slug}`.replace(/\/$/, "");
  const website = apiServer.websiteUrl.replace(/\/$/, "");
  const alternatesLanguages = {
    ar: `${website}/quiz/${quiz.slug}`,
    en: `${website}/en/quiz/${quiz.slug}`,
    "x-default": `${website}/quiz/${quiz.slug}`,
  };
  const hreflangLinks = Object.entries(alternatesLanguages)
    .map(
      ([lang, url]) =>
        `<link rel="alternate" hreflang="${lang}" href="${url}" />`
    )
    .join("\n");
  const rssUrl = `${baseUrl}quiz/rss.xml`;
  const siteName = metaConfig.siteName[lang];
  const description = metaConfig.description[lang];

  // JSON-LD Data
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: canonicalUrl,
    description: description,
    inLanguage: lang,
    image: `${apiServer.websiteUrl}ogicon.webp`,
    logo: { "@type": "ImageObject", url: `${apiServer.websiteUrl}footerlogo.webp` },
    sameAs: [
      "https://www.facebook.com/storycircuit",
      "https://x.com/thestorycircuit",
      "https://in.pinterest.com/ncrehman/",
      "https://benable.com/ncrehman",
      "https://substack.com/@ncrehman"
    ],
    publisher: {
      "@type": "Organization",
      name: siteName,
      logo: { "@type": "ImageObject", url: `${apiServer.websiteUrl}icons/android-icon-192x192.png` }
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${apiServer.websiteUrl}search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  const storyJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": quiz.title,
    "description": quiz.metaDescription,
    "image": [quiz.bannerImage, quiz.landScapeBanner, quiz.squareBanner].filter(Boolean),
    "datePublished": new Date(quiz.publishDate).toISOString(),
    "dateModified": new Date(quiz.publishDate).toISOString(),
    "author": {
      "@type": "Person",
      "name": quiz.author_name,
      "url": baseUrl + "author/" + quiz.author_slug
    },
    "publisher": {
      "@type": "Organization",
      "name": siteName,
      "logo": {
        "@type": "ImageObject",
        "url": `${apiServer.websiteUrl}icons/android-icon-192x192.png`,
        "width": 192,
        "height": 192
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    },
    "isAccessibleForFree": true
  };

  let itemListJson = null;
  if (quiz.relatedStories?.length) {
    itemListJson = generateItemList({
      name: "Quronfula Quiz Collection",
      description: description,
      baseUrl: baseUrl + "quiz/",
      listUrl: baseUrl + "quiz/",
      items: quiz.relatedStories.slice(0, 5).map((a) => ({
        title: a.title,
        slug: a.slug,
        image: a.bannerImage,
        type: "Quiz",
      })),
      creatorName: siteName,
      creatorUrl: apiServer.websiteUrl,
    });

  }

  const breadCrumb = generateBreadcrumb("Menu", [
    { name: siteName, url: "https://www.quronfula.com/" },
    { name: "Quiz Visual Story", url: "https://www.quronfula.com/quiz/" },
    { name: quiz.metaTitle, url: canonicalUrl }
  ]);

  const gradients = [
    ['#f3633fff', '#ef9b5bff'], ['#6A11CB', '#2575FC'], ['#F7971E', '#FFD200'],
    ['#2ac5a6ff', '#191654'], ['#0F2027', '#203A43'], ['#2C3E50', '#4CA1AF'],
    ['#4B6CB7', '#182848'], ['#FF416C', '#FF4B2B'], ['#1D4350', '#A43931'],
    ['#373B44', '#4286f4']
  ];

  //   const firstPage = `
  // <amp-story-page id="banner-page" auto-advance-after="2s">
  //   <amp-story-grid-layer template="fill">
  //     <amp-img src="${quiz.bannerImage}" layout="fill" alt="${quiz.title}"></amp-img>
  //   </amp-story-grid-layer>
  // </amp-story-page>
  // `;

  const firstPage = `
<amp-story-page id="banner-page" auto-advance-after="2s">
  <amp-story-grid-layer template="fill">
    <amp-img src="${quiz.bannerImage}" layout="fill" alt="${quiz.title}"></amp-img>
  </amp-story-grid-layer>

  <amp-story-grid-layer  template="horizontal" class="banner-title-layer">
    <div class="banner-title">
      <h1>${quiz.title}</h1>
    </div>
  </amp-story-grid-layer>
</amp-story-page>
`;
const backendEndpoint = `${apiServer.websiteUrl}api/quiz-proxy`;
  // const backendEndpoint = `${apiServer.websiteUrl}blogs/interact/submit`;
  // const backendEndpoint = `http://localhost:8080/storsycircuit/interact/submit`;

  function generateDynamicQuizSlide(slide: QuizSlide, bgImage: string, index: number, id: string, icon: string) {
    const options = slide.options.slice(0, 4);
    const correctIndex = Math.max(0, options.findIndex(
      o => o.trim().toLowerCase() === slide.answer.trim().toLowerCase()
    ));

    const optionAttrs = options.map((opt, i) => {
      const safeOpt = opt.replace(/"/g, '&quot;'); // AMP-safe escaping
      const base = `option-${i + 1}-text="${safeOpt}"`;
      const isCorrect = i === correctIndex ? `option-${i + 1}-correct option-${i + 1}-confetti="${icon}"` : "";
      return [base, isCorrect].filter(Boolean).join(" ");
    });

    return `
<amp-story-page id="slide-${index}">
  <amp-story-grid-layer template="fill">
    <amp-img src="${bgImage}" layout="fill" object-fit="cover" alt="Background image"></amp-img>
  </amp-story-grid-layer>
  <amp-story-grid-layer template="vertical" class="quiz-center">
    <div class="quiz-wrapper" animate-in="scale-fade-up">
      <h2 class="quiz-question">${slide.question}</h2>
      <amp-story-interactive-quiz
        id="${slide.id}-${id}"
        endpoint="${backendEndpoint}"
        class="center"
        prompt-size="medium"
        chip-style="transparent"
        on="optionSelected:AMP.setState({quiz:{total:quiz.total+1,correct:quiz.correct+(event.correct?1:0),percentage:((quiz.correct+(event.correct?1:0))/(quiz.total+1))*100}})"
        ${optionAttrs.join(" ")}
      ></amp-story-interactive-quiz>
    </div>
  </amp-story-grid-layer>
</amp-story-page>
`;
  }

  const slideHtml = quiz.slides.map((slide, i) => {
    const [c1, c2] = gradients[i % gradients.length];
    const bgImage = `/api/gradient?c1=${encodeURIComponent(c1)}&c2=${encodeURIComponent(c2)}`;
    const icon = quiz.result?.[0]?.icon ?? '🎉';
    return generateDynamicQuizSlide(slide, bgImage, i, quiz.id, icon);
  }).join('');

  function generateResultPage(commonBg: string, result?: QuizResultMeterResponse[]) {
    const resultsToRender = (result?.length ? result : [
      { category: "Beginner", text: "Don’t worry! Every expert was once a beginner.", threshold: "0" },
      { category: "Intermediate", text: "Good effort! You’re learning fast.", threshold: "50" },
      { category: "Expert", text: "Great job! You really know your stuff.", threshold: "80" },
      { category: "Master", text: "Outstanding! You’re a true master 🎉", threshold: "95" }
    ]);

    const ampResultsAttributes = resultsToRender.map((r, idx) => `
      option-${idx + 1}-results-category="${r.category}"
      option-${idx + 1}-text="${r.text.replace(/"/g, '&quot;')}"
      option-${idx + 1}-results-threshold="${r.threshold}"
    `).join("\n");

    return `
<amp-story-page id="results-page">
  <amp-story-grid-layer template="fill">
    <amp-img src="${commonBg}" layout="fill" object-fit="cover" alt="Results Background"></amp-img>
    <div class="overlay"></div>
  </amp-story-grid-layer>
  <amp-story-grid-layer template="vertical" class="quiz-center">
    <div class="result-wrapper">
      <h3>
        <amp-story-interactive-results
          id="results-1"
          prompt-text=""
          ${ampResultsAttributes}
          style="--interactive-background-color: rgba(255,255,255,0.05); --interactive-font-color: #fff; --interactive-border-radius: 16px;">
        </amp-story-interactive-results>
      </h3>
      <p>Celebrate your knowledge! Share your score with friends or try again to improve.</p>
    </div>
  </amp-story-grid-layer>
</amp-story-page>
`;
  }

  const commonBg = `/api/gradient?c1=${encodeURIComponent('#FF7E5F')}&c2=${encodeURIComponent('#FEB47B')}`;
  const allPages = firstPage + slideHtml + generateResultPage(commonBg, quiz.result);

  const templatePath = path.join(process.cwd(), "src/components/commonquiz/quiz.html");
  const templateSource = fs.readFileSync(templatePath, "utf-8");
  const template = Handlebars.compile(templateSource);
  const [c1, c2] = gradients[5 % gradients.length];
  const bgImage = `/api/gradient?c1=${encodeURIComponent(c1)}&c2=${encodeURIComponent(c2)}`;

  const html = template({
    lang: lang,
    title: quiz.title,
    metaTitle: quiz.metaTitle || quiz.title,
    metaDescription: quiz.metaDescription,
    canonicalUrl,
    hreflangLinks,
    rssUrl,
    storyTitle: quiz.title,
    posterImage: quiz.bannerImage,
    posterSqaure: quiz.squareBanner,
    posterPortrait: quiz.bannerImage,
    posterLandScape: quiz.landScapeBanner,
    allPages,
    keywords: quiz.keywords,
    datePublished: new Date(quiz.publishDate).toISOString(),
    dateModified: new Date(quiz.publishDate).toISOString(),
    siteName,
    jsonLd: JSON.stringify(storyJsonLd),
    orgJsonLd: JSON.stringify(orgJsonLd),
    breadcrumbJson: JSON.stringify(breadCrumb),
    itemJsonLd: JSON.stringify(itemListJson),
    relatedStoriesHtml: quiz.relatedStories?.slice(0, 5).map(rel => `
      <a class="related-story-block" href="${baseUrl + "quiz/" + rel.slug}">
        <amp-img width="138" height="184" layout="responsive" class="img-fill" src="${rel.bannerImage}" alt="${rel.title}"></amp-img>
        <span class="related-story-title">${rel.title}</span>
      </a>
    `).join('') || '',
    bgImage,
    relatedStories: quiz.relatedStories || [],
  });

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" }
  });
}
