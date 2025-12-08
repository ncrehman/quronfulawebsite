import { SocialLinks } from '../models/SocialLinks';

export class AuthorResponse {
    public id: string;
    public fullName: string;
    public profileImage: string;
    public slug: string;
    public bio: string;
    public bioDescription: string;
    public roleName: string;
    public socialLinks: Array<SocialLinks>;
}
