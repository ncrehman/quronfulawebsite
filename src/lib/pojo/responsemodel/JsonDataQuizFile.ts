import { QuizSlide } from './QuizSlide';
import { QuizIntro } from './QuizIntro';
import { QuizFinal } from './QuizFinal';

export class JsonDataQuizFile {
    public title: string;
    public slides: Array<QuizSlide>;
    public intro: Array<QuizIntro>;
    public finalSlide: QuizFinal;
    public metaTitle: string;
    public cta: string;
    public metaDescription: string;
    public slug: string;
    public imageAlt: string;
    public keywords: string;
}
