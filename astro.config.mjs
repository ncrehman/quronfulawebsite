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



    // Enable SSR later if using server rendering
    // output: "server" or "static"
});
