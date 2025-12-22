
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
    public publishedAt: Instant;
    public fetchedAt: Instant;
    public rankabilityScore: number = 0;
    public createdDate: Date;
}
