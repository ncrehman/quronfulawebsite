
export class SubCategoryResponse {
    public id: string;
    public title: string;
    public description: string;
    public metaTitle: string;
    public metaDescription: string;
    public lang: string;
    public slug: string;
    public keywords: string;
    public thumbnailImage: string;
    public bannerImage: string;
    public imageAlt: string;
    public contentCount: number = 0;
    public active: Boolean;
    public order: number = 0;
    public cat_id: string;
    public cat_name: string;
    public cat_slug: string;
    public cat_banner: string;
    public createdDate: Date;
}
