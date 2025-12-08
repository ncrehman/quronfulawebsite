import { QuizResultMeter } from './QuizResultMeter';
import { JsonDataQuizFile } from './JsonDataQuizFile';

export class JsonQuizFileMaster {
    public contextLink: string;
    public resultMeter: Array<QuizResultMeter>;
    public en: JsonDataQuizFile;
    public fr: JsonDataQuizFile;
    public hi: JsonDataQuizFile;
    public ar: JsonDataQuizFile;
}
