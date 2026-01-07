import PQueue from 'p-queue'
import type { VitePluginRegistryMetadata } from './types.js'
import * as v from 'valibot'
import { MetadataSchema } from '../metadata-schema.js'

/**
 * Fetches and validates custom metadata from URLs specified in package.json
 */
export class MetadataFetcher {
  private readonly queue = new PQueue({ concurrency: 5 })
  private readonly timeoutMs = 5000
  private readonly cache = new Map<string, VitePluginRegistryMetadata | null>()

  /**
   * Fetch metadata from a URL
   */
  async fetch(url: string): Promise<VitePluginRegistryMetadata | null> {
    if (this.cache.has(url)) {
      return this.cache.get(url) ?? null
    }

    const result = await this.queue.add(async () => {
      try {
        const parsedUrl = new URL(url)

        if (parsedUrl.protocol !== 'https:') {
          console.warn(`Metadata URL must be HTTPS: ${url}`)
          return null
        }

        const response = await fetch(url, {
          signal: AbortSignal.timeout(this.timeoutMs),
          headers: {
            Accept: 'application/json',
            'User-Agent': 'vite-plugin-registry/1.0',
          },
        })
        if (!response.ok) {
          console.warn(`Metadata fetch failed for ${url}: ${response.status}`)
          return null
        }

        const data = await response.json()
        if (!this.validate(data)) {
          console.warn(`Invalid metadata format from ${url}`)
          return null
        }

        return data
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            console.warn(`Metadata fetch timed out for ${url}`)
          } else {
            console.warn(`Metadata fetch error for ${url}: ${error.message}`)
          }
        }
        return null
      }
    })

    this.cache.set(url, result)
    return result
  }

  /**
   * Validate metadata against the expected schema
   */
  private validate(data: unknown): data is VitePluginRegistryMetadata {
    return v.safeParse(MetadataSchema, data).success
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear()
  }
}
