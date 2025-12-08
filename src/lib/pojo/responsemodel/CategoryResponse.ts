
export class CategoryResponse {
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
    public subCategoryCount: number = 0;
    public active: Boolean;
    public order: number = 0;
    public createdDate: Date;
}
