const badges = {
  rollup: { label: 'Rollup', logo: 'rollup.js' },
  rolldown: { label: 'Rolldown', logo: 'rolldown' },
  vite: { label: 'Vite', logo: 'vite' },
}

const defaultCacheableHeader = {
  'Cache-Control': 'public, max-age=3600',
}

const packageNamePattern = /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (url.pathname === '/api/badges') {
      const packageName = url.searchParams.get('package')
      if (!packageName) {
        return new Response('`package` query is required', {
          status: 400,
          headers: defaultCacheableHeader,
        })
      }
      if (!packageNamePattern.test(packageName)) {
        return new Response('Invalid package name', {
          status: 400,
          headers: defaultCacheableHeader,
        })
      }

      const tool = url.searchParams.get('tool')
      const badge = tool ? badges[tool] : undefined
      if (!tool) {
        return new Response('`tool` query is required', {
          status: 400,
          headers: defaultCacheableHeader,
        })
      }
      if (!badge) {
        return new Response('Unsupported tool', { status: 400, headers: defaultCacheableHeader })
      }

      const target = new URL('https://img.shields.io/badge/dynamic/json')
      target.search = new URLSearchParams({
        url: 'https://registry.vite.dev/api/plugin-badges.json',
        query: '$[`' + packageName + '].' + tool,
        logo: badge.logo,
        label: badge.label,
        color: '9135FF',
      }).toString()

      return new Response(null, {
        status: 302,
        headers: { Location: target.toString(), ...defaultCacheableHeader },
      })
    }

    return env.ASSETS.fetch(request)
  },
}
