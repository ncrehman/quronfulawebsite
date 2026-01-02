import { SubCategory } from './SubCategory';
import { Category } from './Category';
import { Languages } from './Languages';
import { FeedContent } from './FeedContent';
import { Roles } from './Roles';
import { Status } from './Status';

export class MasterObjects {
    public subCategoryId: SubCategory;
    public categoryId: Category;
    public languagess: Languages;
    public feedContents: FeedContent;
    public subCategoryLists: Array<SubCategory>;
    public categoryList: Array<Category>;
    public roless: Roles;
    public statuss: Status;
    public backLinkName: string;
}
