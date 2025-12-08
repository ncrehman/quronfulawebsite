import { Users } from './Users';

export class ExcelReportRequest {
    public id: string;
    public toEmailId: string;
    public reportType: string;
    public fromDate: Date;
    public toDate: Date;
    public userObject: Users;
    public requestedDate: Date;
    public isDelivered: Boolean;
    public sentDate: Date;
}
