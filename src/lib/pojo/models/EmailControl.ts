
export class EmailControl {
    public id: string;
    public emailEnabled: Boolean;
    public lastEmailSentAt: LocalDateTime;
    public throttleMinutes: number = 0;
    public environment: string;
    public updatedBy: string;
    public updatedAt: LocalDateTime;
}
