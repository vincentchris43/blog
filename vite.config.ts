import { defineConfig } from 'vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    tanstackStart({
      // The home page links to every post, including dynamically routed slugs.
      // https://tanstack.com/start/latest/docs/framework/react/guide/static-prerendering
      prerender: {
        enabled: true,
        autoSubfolderIndex: true,
        crawlLinks: true,
        failOnError: true,
      },
      pages: [{ path: '/404', prerender: { outputPath: '/404.html' } }],
      // A production hostname belongs to deployment configuration.
      sitemap: { enabled: false },
    }),
    viteReact(),
  ],
})

export default config
