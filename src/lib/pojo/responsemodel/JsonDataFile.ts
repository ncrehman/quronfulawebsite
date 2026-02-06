import { HowToSchema } from './HowToSchema';
import { FaqSchema } from './FaqSchema';

export class JsonDataFile {
    public title: string;
    public subTitle: string;
    public description: string;
    public metaTitle: string;
    public metaDescription: string;
    public slug: string;
    public url: string;
    public gumroadUrl: string;
    public imageAlt: string;
    public imageCaption: string;
    public keywords: string;
    public primary_keyword: string;
    public howToSchema: HowToSchema;
    public faqSchema: Array<FaqSchema>;
}
