import { RssFeedRender } from "@components/common/RssFeedRender";
import { getAppConfig } from "@lib/AppConfig";

// ✅ MUST be named export called GET
export async function GET() {
const apiServer = await getAppConfig();
  return RssFeedRender(apiServer.defaultLanguage, 'stories',20);

}


