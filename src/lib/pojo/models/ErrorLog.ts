
export class ErrorLog {
    public id: string;
    public applicationName: string;
    public clientIp: string;
    public httpMethod: string;
    public requestUrl: string;
    public httpStatus: number = 0;
    public exceptionClass: string;
    public errorMessage: string;
    public controllerName: string;
    public methodName: string;
    public lineNumber: number = 0;
    public stackTrace: string;
    public createdAt: Date;
    public billingPeriod: string;
    public date: string;
    public localDate: string;
    public createdDate: Date;
}
