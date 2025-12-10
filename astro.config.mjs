import { defineConfig } from "astro/config";
import image from "@astrojs/image";
import sitemap from "@astrojs/sitemap";
import node from "@astrojs/node";


export default defineConfig({
    site: "https://www.quronfula.com",
    integrations: [image(), sitemap()],
    output: 'server',
    adapter: node({
        mode: "standalone",  // bundles everything for deployment
    }),
    vite: {
        ssr: {
            noExternal: ['axobject-query'], // Force Vite to bundle it correctly
        },
        optimizeDeps: {
            include: ['axobject-query'],
        },
    },


    // Enable SSR later if using server rendering
    // output: "server" or "static"
});
