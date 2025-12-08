import { ArticleResponse } from './ArticleResponse';
import { CatResponse } from './CatResponse';

export class HomeDataResponse {
    public featureList: Array<ArticleResponse>;
    public categoryList: Array<CatResponse>;
    public articleList: Array<ArticleResponse>;
}
