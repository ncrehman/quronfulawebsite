
export class SiteMapResponse {
    public url: string;
    public slug: string;
    public cat_slug: string;
    public publishDate: Date;
    public createdDate: Date;
    public updatedDate: Date;
    public lastModified: string;
    public priority: number = 0;
    public changeFreq: string;
}
