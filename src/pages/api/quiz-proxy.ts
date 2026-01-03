// src/pages/api/quiz-proxy.ts (Astro endpoint or Next.js API route)
import type { APIRoute } from 'astro';

export const post: APIRoute = async ({ request, url }) => {
    try {
        const queryString = url.searchParams.toString();

        const res = await fetch('https://www.quronfula.com/blogs/interact/submit?'+queryString, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-TENANT': 'quronfula',
            },

        });

        const data = await res.json();
        return new Response(JSON.stringify(data), { status: res.status });
    } catch (err) {
        return new Response(JSON.stringify({ error: 'Failed to submit quiz' }), { status: 500 });
    }
};
