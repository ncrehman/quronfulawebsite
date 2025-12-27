import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import node from "@astrojs/node";
import partytown from '@astrojs/partytown';

export default defineConfig({
    site: "https://www.quronfula.com",
    integrations: [
    partytown({
      config: {
        forward: ['dataLayer.push'],  // Essential for gtag
      },
    }),
    sitemap()
  ],
    output: 'server',
    adapter: node({
        mode: "standalone",
    }),
    vite: {
        ssr: {
            noExternal: ['axobject-query'],
        },
        optimizeDeps: {
            include: ['axobject-query'],
        },
        build: {
            minify: 'esbuild', // default but explicit is better
             sourcemap: false,
        }
    },
});