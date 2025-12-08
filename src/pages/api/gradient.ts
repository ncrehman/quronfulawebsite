import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const c1 = searchParams.get("c1") || "#FF7E5F";
  const c2 = searchParams.get("c2") || "#FEB47B";

  const svg = `
    <svg width="720" height="1280" viewBox="0 0 720 1280" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dynamicGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${c1}"/>
          <stop offset="100%" stop-color="${c2}"/>
        </linearGradient>
      </defs>
      <rect width="720" height="1280" fill="url(#dynamicGradient)"/>
    </svg>
  `;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
};
