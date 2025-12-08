import { HrefData } from './HrefData';

export class SiteMapData {
    public url: string;
    public defaultUrl: string;
    public lastModified: Date;
    public priority: string;
    public changeFreq: string;
    public hrefLangs: Array<HrefData>;
}
