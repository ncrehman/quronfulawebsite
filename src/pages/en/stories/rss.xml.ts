import { RssFeedRender } from "@components/common/RssFeedRender";

// ✅ MUST be named export called GET
export async function GET() {

  return RssFeedRender('en', 'stories',20);

}


