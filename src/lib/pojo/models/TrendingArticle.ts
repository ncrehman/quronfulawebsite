
export class TrendingArticle {
    public id: string;
    public title: string;
    public country: string;
    public language: string;
    public source: string;
    public link: string;
    public keyword: string;
    public subCatId: string;
    public subCatName: string;
    public catId: string;
    public catName: string;
    public articleWritten: Boolean;
    public publishedAt: number = 0;
    public fetchedAt: number = 0;
    public rankabilityScore: number = 0;
    public createdDate: Date;
}
