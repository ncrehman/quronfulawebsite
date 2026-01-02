import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';
import partytown from '@astrojs/partytown';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://www.quronfula.com',

  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),

  integrations: [
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
    sitemap(),
    tailwind(),
  ],

  vite: {
    ssr: {
      noExternal: ['axobject-query'],
    },
    optimizeDeps: {
      include: ['axobject-query'],
    },
    build: {
      minify: 'terser',
      sourcemap: false,
      terserOptions: {
        compress: {
          drop_console: false,
          pure_funcs: ['console.info', 'console.debug'],
        },
        mangle: true,
        format: {
          comments: false,
        },
      },
    },
  },

  build: {
    inlineStylesheets: 'always',
  },
});
