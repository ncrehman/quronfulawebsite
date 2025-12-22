
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
    public articleWritten: Boolean;
    public publishedAt: number;
    public fetchedAt: number;
    public rankabilityScore: number = 0;
    public createdDate: Date;
}
