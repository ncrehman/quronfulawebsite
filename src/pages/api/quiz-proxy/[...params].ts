import type { APIRoute } from 'astro';

/**
 * AMP-required headers helper
 */
function ampHeaders(url: URL, request: Request) {
  const sourceOrigin = url.searchParams.get('__amp_source_origin')!;
  const requestOrigin =
    request.headers.get('origin') || sourceOrigin;

  return {
    'Content-Type': 'application/json; charset=utf-8',

    // AMP CORS
    'Access-Control-Allow-Origin': requestOrigin,
    'Access-Control-Expose-Headers':
      'AMP-Access-Control-Allow-Source-Origin',
    'AMP-Access-Control-Allow-Source-Origin': sourceOrigin,

    // 🚨 REQUIRED FOR AMP STORY INTERACTIVE
    'Cache-Control': 'no-store',

    'Vary': 'Origin',
  };
}
function ampHeadersOld(url: URL, request: Request) {
  const sourceOrigin = url.searchParams.get('__amp_source_origin') || '';
  const requestOrigin = request.headers.get('origin') || '*';

  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': requestOrigin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Expose-Headers':
      'AMP-Access-Control-Allow-Source-Origin',
    'AMP-Access-Control-Allow-Source-Origin': sourceOrigin,
    'Vary': 'Origin',
  };
}
/**
 * GET – Fetch quiz state
 * URL: /api/quiz-proxy/{encodedId}
 */
export const GET: APIRoute = async ({ url, params, request }) => {
  const [encodedId] = params.params ?? [];

  const backendUrl =
    `https://www.quronfula.com/blogs/interact/submit/${encodedId}?${url.searchParams}`;

  const res = await fetch(backendUrl, {
    headers: { 'X-TENANT': 'quronfula' },
  });

  const data = await res.json();

  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: ampHeaders(url, request),
  });
};

/**
 * POST – Submit vote
 * URL: /api/quiz-proxy/{encodedId}/{vote}
 */
export const POST: APIRoute = async ({ url, params, request }) => {
  const [encodedId, vote] = params.params ?? [];
console.log('enconded2: '+encodedId)

  if (!encodedId || !vote) {
    return new Response(
      JSON.stringify({ error: 'Missing encodedId or vote' }),
      { status: 400 }
    );
  }

  const body = await request.text();

  const backendUrl =
    `https://www.quronfula.com/blogs/interact/submit/${encodedId}/${vote}?${url.searchParams}`;

  const res = await fetch(backendUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-TENANT': 'quronfula',
    },
    body,
  });

  const data = await res.json();
console.log(
  'input ',
  JSON.stringify(data, null, 2)
);
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: ampHeaders(url,request),
  });
};

/**
 * OPTIONS – Required by AMP (CORS preflight)
 */
export const OPTIONS: APIRoute = async ({ url, request }) => {
  return new Response(null, {
    status: 204,
    headers: {
      ...ampHeaders(url, request),
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
export const OPTIONSOld: APIRoute = async ({ url ,request}) => {
  return new Response(null, {
    status: 204,
    headers: {
      ...ampHeaders(url,request),
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
