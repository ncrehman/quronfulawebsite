import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url, params }) => {
  try {
    const encodedId = params.encodedId;
    const queryString = url.searchParams.toString();

    const backendUrl =
      `https://www.quronfula.com/blogs/interact/submit/${encodedId}?${queryString}`;

    const res = await fetch(backendUrl, {
      headers: {
        'X-TENANT': 'quronfula',
      },
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Failed to submit quiz' }),
      { status: 500 }
    );
  }
};
