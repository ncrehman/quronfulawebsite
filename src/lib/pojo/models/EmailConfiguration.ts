import { SendUpdateMail } from './SendUpdateMail';

export class EmailConfiguration {
    public id: string;
    public toMailIds: Array<SendUpdateMail>;
    public ccEmailIds: Array<SendUpdateMail>;
    public bccEmailIds: Array<SendUpdateMail>;
    public type: string;
}
