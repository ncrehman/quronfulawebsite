import { ArticleResponse } from './ArticleResponse';
import { CatResponse } from './CatResponse';
import { WebStoryResponse } from './WebStoryResponse';
import { QuizStoryResponse } from './QuizStoryResponse';

export class HomeDataResponse {
    public lang: string;
    public slug: string;
    public featureList: Array<ArticleResponse>;
    public categoryList: Array<CatResponse>;
    public articleList: Array<ArticleResponse>;
    public storyList: Array<WebStoryResponse>;
    public quizList: Array<QuizStoryResponse>;
}
