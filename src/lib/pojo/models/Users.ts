import { SocialLinks } from './SocialLinks';
import { Roles } from './Roles';
import { Status } from './Status';

export class Users {
    public id: string;
    public fullName: string;
    public emailAddress: string;
    public mobileNumber: string;
    public profileImage: string;
    public slug: string;
    public bio: string;
    public bioDescription: string;
    public socialLinks: Array<SocialLinks>;
    public password: string;
    public rolesObj: Roles;
    public statusObj: Status;
    public isDeleted: Boolean;
    public loginAttempt: number = 0;
    public isOnline: Boolean;
    public lastLogin: Date;
    public createdBy: string;
    public updatedBy: string;
    public updatedDate: Date;
    public createdDate: Date;
}
