import { HrefData } from './HrefData';

export class SiteMapData {
    public title: string;
    public url: string;
    public defaultUrl: string;
    public lastModified: Date;
    public priority: string;
    public changeFreq: string;
    public bannerImage: string;
    public squareBanner: string;
    public landScapeBanner: string;
    public hrefLangs: Array<HrefData>;
}
