import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';
import partytown from '@astrojs/partytown';

export default defineConfig({
    site: 'https://www.quronfula.com',

    output: 'server',
    adapter: node({
        mode: 'standalone',
    }),

    integrations: [
        partytown({
            config: {
                forward: ['dataLayer.push'], // Required for gtag/Google Analytics to work
            },
        }),
        sitemap(),
    ],

    vite: {
        ssr: {
            noExternal: ['axobject-query'],
        },
        optimizeDeps: {
            include: ['axobject-query'],
        },
        build: {
            // Switch to Terser for better minification and higher Lighthouse scores
            minify: 'terser',
            sourcemap: false,

            // Optional: Fine-tune Terser for even better compression
            terserOptions: {
                compress: {
                    drop_console: false, // Set to true in production if you want to remove console.logs
                    pure_funcs: ['console.info', 'console.debug'], // Removes specific console calls
                },
                mangle: true,
                format: {
                    comments: false, // Strip all comments
                },
            },
        },
    },
    build: {
        inlineStylesheets: 'always',  // Inlines ALL CSS into <style> tags in HTML
    },
});
// import { defineConfig } from "astro/config";
// import sitemap from "@astrojs/sitemap";
// import node from "@astrojs/node";
// import partytown from '@astrojs/partytown';

// export default defineConfig({
//     site: "https://www.quronfula.com",
//     integrations: [
//     partytown({
//       config: {
//         forward: ['dataLayer.push'],  // Essential for gtag
//       },
//     }),
//     sitemap()
//   ],
//     output: 'server',
//     adapter: node({
//         mode: "standalone",
//     }),
//     vite: {
//         ssr: {
//             noExternal: ['axobject-query'],
//         },
//         optimizeDeps: {
//             include: ['axobject-query'],
//         },
//         build: {
//             minify: 'esbuild', // default but explicit is better
//              sourcemap: false,
//         }
//     },
// });