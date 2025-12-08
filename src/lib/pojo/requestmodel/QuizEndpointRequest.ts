import { QuizEnpointResponse } from '../responsemodel/QuizEnpointResponse';

export class QuizEndpointRequest {
    public quizUrl: string;
    public answer: string;
    public quizId: string;
    public responses: Array<QuizEnpointResponse>;
    public elapsedTime: number = 0;
}
