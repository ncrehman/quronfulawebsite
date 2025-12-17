import fs from "fs";
import path from "path";
// import Handlebars from "handlebars";
import Handlebars from "handlebars/dist/handlebars.js";
Handlebars.registerHelper("eq", function (a, b, options) {
  if (a === b) {
    return options.fn ? options.fn(this) : '';
  }
  return options.inverse ? options.inverse(this) : '';
});
import { metaConfig } from "../metaConfig";
import type { WebStoryResponse } from "@lib/pojo/responsemodel/WebStoryResponse";
import { getAppConfig } from "@lib/AppConfig";
import { generateBreadcrumb, generateItemList } from "@lib/postmethodService";
export interface WebStoryAmpRendererProps {
  story: WebStoryResponse;
  lang?: string;
}

export default async function WebStoryAmpRenderer({ story, lang }: WebStoryAmpRendererProps) {
  const apiServer = await getAppConfig();
  lang = lang ? lang : 'ar';
  const baseUrl =
    lang && lang !== "ar"
      ? `${apiServer.websiteUrl}${lang}/`
      : apiServer.websiteUrl;

  const rssUrl = `${baseUrl}stories/rss.xml`;
  const canonicalUrl = `${baseUrl}stories/${story.slug}`.replace(/\/$/, "");
  // let ampRef = '';
  // if (story.referenceLink != null) {
  //   if (story.referenceLink.includes('/article/')) {
  //     ampRef = story.referenceLink;
  //   } else {
  //     ampRef = `${baseUrl}stories/${story.slug}`.replace(/\/$/, "");
  //   }
  // } else {
  //   ampRef = `${baseUrl}stories/${story.slug}`.replace(/\/$/, "");
  // }
  const siteName = metaConfig.siteName[lang];
  const description = metaConfig.description[lang];
  // Languages

  // JSON-LD Data
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: canonicalUrl,
    description: description,
    inLanguage: lang,
    image: `${apiServer.websiteUrl}ogicon.jpg`,
    logo: { "@type": "ImageObject", url: `${apiServer.websiteUrl}footerlogo.png` },
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
    "headline": story.title,
    "description": story.metaDescription,
    "image": [
      story.bannerImage,
      story.landScapeBanner,
      story.squareBanner
    ],
    "datePublished": new Date(story.publishDate).toISOString(),
    "dateModified": new Date(story.publishDate).toISOString(),
    "author": {
      "@type": "Person",
      "name": story.author_name,
      "url": baseUrl + "author/" + story.author_slug
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

  if (story.relatedStories) {
    itemListJson = generateItemList({
      name: "Quronfula Web Story Collection",
      description: description,
      baseUrl: baseUrl + "stories/",
      listUrl: baseUrl + "stories/",
      items: story.relatedStories.slice(0, 5).map((a) => ({
        title: a.title,
        slug: a.slug,
        image: a.bannerImage,
        type: "WebStory",
      })),
      creatorName: siteName,
      creatorUrl: apiServer.websiteUrl,
    });
  }

  const breadCrumb = generateBreadcrumb("Menu", [
    { name: siteName, url: "https://www.quronfula.com/" },
    { name: "Visual Story", url: "https://www.quronfula.com/stories/" },
    { name: story.metaTitle, url: canonicalUrl.endsWith('/') ? canonicalUrl : canonicalUrl + '/' }
  ]);
  // const backgroundImages = [
  //   '/common_web_background_0.png',
  //   '/common_web_background_1.png',
  //   '/common_web_background_2.png',
  //   '/common_web_background_3.png'
  // ];

  const animations = [
    "fade-in",
    "fly-in-left",
    "fly-in-right",
    "fly-in-top",
    "fly-in-bottom",
    "whoosh-in-right",
    "pulse"
  ];
  const gradients = [
    ['#FF7E5F', '#FEB47B'], // warm peach
    ['#6A11CB', '#2575FC'], // purple to blue
    ['#F7971E', '#FFD200'], // golden yellow
    ['#43C6AC', '#191654'], // teal to deep navy
    ['#0F2027', '#203A43'], // dark blue gradient
    ['#2C3E50', '#4CA1AF'], // slate blue to teal
    ['#4B6CB7', '#182848'], // soft blue to dark navy
    ['#FF416C', '#FF4B2B'], // pink to deep red
    ['#1D4350', '#A43931'], // teal to muted red
    ['#373B44', '#4286f4']  // dark gray to bright blue
  ];
  // Related Stories + Conditional CTA
  const relatedStoriesHtml =
    story.relatedStories?.length
      ? `
<div class="block related-stories-container">
  ${story.relatedStories
        .map(
          rel => `
      <a class="related-story-block" href="${baseUrl + "stories/" + rel.slug}">
        <amp-img width="138" height="184" layout="responsive" class="img-fill"
                 src="${rel.bannerImage}" alt="${rel.title}">
        </amp-img>
        <span class="related-story-title">${rel.title}</span>
      </a>
  `
        )
        .join("")}
</div>

${story.cta && story.cta.trim() !== "" ? `
<div class="cta-section">
  <a href="${apiServer.websiteUrl}stories"
     class="cta-button"
     target="_blank" rel="noopener noreferrer">
     ${story.cta} →
  </a>
</div>
` : ""}
`
      : `
${story.cta && story.cta.trim() !== "" ? `
<div class="cta-section">
  <a href="${apiServer.websiteUrl}stories"
     class="cta-button"
     target="_blank" rel="noopener noreferrer">
     ${story.cta} →
  </a>
</div>
` : ""}
`;


  const firstPage = `
<amp-story-page id="banner-page" auto-advance-after="2s">
  <amp-story-grid-layer template="fill">
    <amp-img src="${story.bannerImage}" layout="fill" alt="${story.title}"></amp-img>
  </amp-story-grid-layer>

  <amp-story-grid-layer  template="horizontal" class="banner-title-layer">
    <div class="banner-title">
      <h1>${story.title}</h1>
    </div>
  </amp-story-grid-layer>
</amp-story-page>
`;

  const slideHtml = story.slides.map((slide, i) => {
    // Pick animation cyclically
    const animation = animations[i % animations.length];
    const delay = (i % 3) * 0.3; // 0s, 0.3s, 0.6s pattern

    // Pick background image cyclically
    // const bgImage = backgroundImages[i % backgroundImages.length];
    const [c1, c2] = gradients[i % gradients.length];
    const bgImage = `/api/gradient?c1=${encodeURIComponent(c1)}&c2=${encodeURIComponent(c2)}`;
    return `
    <amp-story-page id="slide-${slide.id ? slide.id : Math.floor(Math.random() * 10000)}" auto-advance-after="${Math.max(slide.duration || 0, 5)}s">

      <!-- Gradient Layer -->
      <!-- Image Layer (cycled) -->
      <amp-story-grid-layer template="fill">
        <amp-img
          src="${bgImage}"
          layout="fill"
          object-fit="cover"
          alt="Background image">
        </amp-img>
      </amp-story-grid-layer>

      <!-- Heading at Top -->
      <amp-story-grid-layer template="vertical" class="heading-layer">
        <div class="heading-container">
           <h3 
              animate-in="fly-in-top"
              animate-in-delay="0.3s"
              animate-in-duration="0.8s">
            ${slide.heading}
          </h3>
        </div>
      </amp-story-grid-layer>

      <!-- Center Text with Animation -->
      <amp-story-grid-layer template="vertical" class="center-content">
        <div class="text-container">
          <h2 
            animate-in="${animation}"
            animate-in-delay="${delay}s"
            animate-in-duration="1s">
            ${slide.text}
          </h2>
        </div>
      </amp-story-grid-layer>

      ${i === story.slides.length - 1 && story.referenceLink
        ? `<amp-story-page-attachment layout="nodisplay" href="${story.referenceLink}">
               Read Full Article
             </amp-story-page-attachment>`
        : ''
      }
    </amp-story-page>
  `;
  }).join('');

  const allPages = firstPage + slideHtml;
  // Load Handlebars template
  const templatePath = path.join(process.cwd(), "src/components/commonstories/webstory.html");
  const templateSource = fs.readFileSync(templatePath, "utf-8");
  const template = Handlebars.compile(templateSource);
  const [c1, c2] = gradients[5 % gradients.length];
  const bgImage = `/api/gradient?c1=${encodeURIComponent(c1)}&c2=${encodeURIComponent(c2)}`;
  const html = template({
    lang: lang || "en",
    title: story.title,
    metaTitle: story.metaTitle || story.title,
    metaDescription: story.metaDescription,
    canonicalUrl,
    ogUrl: canonicalUrl,
    rssUrl,
    storyTitle: story.title,
    posterImage: story.bannerImage,
    posterSqaure: story.squareBanner,
    posterPortrait: story.bannerImage,
    posterLandScape: story.landScapeBanner,
    allPages,
    keywords: story.keywords,
    datePublished: new Date(story.publishDate).toISOString(),
    dateModified: new Date(story.publishDate).toISOString(),
    siteName,
    jsonLd: JSON.stringify(storyJsonLd),
    orgJsonLd: JSON.stringify(orgJsonLd),
    breadcrumbJson: JSON.stringify(breadCrumb),
    itemJsonLd: JSON.stringify(itemListJson),
    relatedStoriesHtml,
    bgImage: bgImage,
    relatedStories: story.relatedStories || []
  });

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" }
  });
}
