export type ToolCompatibility =
  | { type: 'compatible'; versions: string; note?: string }
  | { type: 'incompatible'; reason: string }
  | { type: 'unknown' }

export interface RegistryPlugin {
  name: string
  description: string
  keywords: string[]
  links: {
    npm: string
    repository?: string
    homepage?: string
  }
  version: string
  updatedAt: string
  compatibility: {
    vite: ToolCompatibility
    rollup: ToolCompatibility
    rolldown: ToolCompatibility
  }
  weeklyDownloads?: number
}

export interface PluginPatch {
  packageName: string
  overrides?: {
    description?: string
    links?: Partial<RegistryPlugin['links']>
    compatibility?: Partial<RegistryPlugin['compatibility']>
  }
  exclude?: {
    enabled: boolean
    reason: string
  }
}

export interface PluginData {
  latestVersions: {
    vite: string
    rollup: string
    rolldown: string
  }
}

async function getLatestVersion(packageName: string): Promise<string> {
  try {
    const response = await fetch(`https://registry.npmjs.org/${packageName}/latest`)
    if (!response.ok) return ''
    const data = await response.json()
    return data.version as string
  } catch {
    return ''
  }
}

export default {
  async load(): Promise<PluginData> {
    const [latestVite, latestRollup, latestRolldown] = await Promise.all([
      getLatestVersion('vite'),
      getLatestVersion('rollup'),
      getLatestVersion('rolldown'),
    ])

    return {
      latestVersions: {
        vite: latestVite || '7.0.0',
        rollup: latestRollup || '4.0.0',
        rolldown: latestRolldown || '1.0.0',
      },
    }
  },
}

declare const data: PluginData
export { data }
