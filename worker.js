const badges = {
  rollup: { label: 'Rollup', logo: 'rollup.js' },
  rolldown: { label: 'Rolldown', logo: 'rolldown' },
  vite: { label: 'Vite', logo: 'vite' },
}

const packageNamePattern = /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (url.pathname === '/api/badges') {
      const packageName = url.searchParams.get('package')
      const tool = url.searchParams.get('tool')
      const badge = Object.hasOwn(badges, tool) ? badges[tool] : undefined

      if (!packageName || !packageNamePattern.test(packageName) || !badge) {
        return new Response('Badge not found', { status: 404 })
      }

      const target = new URL('https://img.shields.io/badge/dynamic/json')
      target.search = new URLSearchParams({
        url: 'https://registry.vite.dev/api/plugin-badges.json',
        query: '$[`' + packageName + '`].' + tool,
        logo: badge.logo,
        label: badge.label,
        color: '9135FF',
      }).toString()

      return Response.redirect(target, 302)
    }

    return env.ASSETS.fetch(request)
  },
}
