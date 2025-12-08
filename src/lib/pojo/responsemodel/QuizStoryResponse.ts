import { QuizSlide } from './QuizSlide';
import { QuizResultMeterResponse } from './QuizResultMeterResponse';
import { RelatedQuizStoryResponse } from './RelatedQuizStoryResponse';

export class QuizStoryResponse {
    public id: string;
    public title: string;
    public metaTitle: string;
    public metaDescription: string;
    public lang: string;
    public slug: string;
    public keywords: string;
    public likeCounts: number = 0;
    public viewCounts: number = 0;
    public bannerImage: string;
    public squareBanner: string;
    public landScapeBanner: string;
    public imageAlt: string;
    public sub_catId: string;
    public sub_catTitle: string;
    public sub_catBanner: string;
    public sub_catslug: string;
    public cat_name: string;
    public cat_id: string;
    public cat_slug: string;
    public cat_banner: string;
    public author_id: string;
    public author_name: string;
    public author_profile: string;
    public author_slug: string;
    public canonicalUrl: string;
    public referenceLink: string;
    public cta: string;
    public slides: Array<QuizSlide>;
    public result: Array<QuizResultMeterResponse>;
    public relatedStories: Array<RelatedQuizStoryResponse>;
    public publishDate: Date;
}
