export interface KeywordItem {
    keyword: string;
    title: string;
    description: string;
}

export interface KeywordsData {
    [lang: string]: KeywordItem[];
}