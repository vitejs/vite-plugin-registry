import { bindings, defineConfig } from 'cf/config'

export default defineConfig({
  worker: {
    name: 'vite-plugin-registry',
    compatibilityDate: '2026-09-28',
    entrypoint: 'worker.js',
    previewUrls: true,
    cache: {
      enabled: true,
    },
    assets: {
      htmlHandling: 'auto-trailing-slash',
      notFoundHandling: '404-page',
    },
    env: {
      ASSETS: bindings.assets(),
    },
  },
})
