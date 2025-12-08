import { getAppConfig, loadAppConfig } from './AppConfig';
import { EndPointPaths } from './EndPointPaths';
import { apiCalls } from './postmethodService';

export async function initAppData(lang: string = 'en') {
    // Ensure app config is loaded
    let appConfig = getAppConfig();
    if (!appConfig) {
        appConfig = await loadAppConfig();
    }

    // Example: load homepage data
    const reqObj = { lang };
    const homePageData = await apiCalls(reqObj, EndPointPaths.gethomepagedata);

    // Example: load featured articles
    const featuredArticles = await apiCalls(reqObj, EndPointPaths.getfeaturedarticle);

    return {
        homePageData,
        featuredArticles,
    };
}
