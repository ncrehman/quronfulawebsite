
export class QuotesCategory {
    public id: string;
    public en_title: string;
    public secondary_title: string;
    public en_description: string;
    public secondary_description: string;
    public en_metaTitle: string;
    public secondary_metaTitle: string;
    public en_metaDescription: string;
    public secondary_metaDescription: string;
    public en_slug: string;
    public secondary_slug: string;
    public en_keyword: string;
    public secondary_keyword: string;
    public thumbnailImage: string;
    public bannerImage: string;
    public en_imageAlt: string;
    public secondary_imageAlt: string;
    public quotesCount: number = 0;
    public showOnArticle: Boolean;
    public showOnStory: Boolean;
    public showOnQuotes: Boolean;
    public active: Boolean;
    public order: number = 0;
    public createdDate: Date;
    public updatedDate: Date;
}
