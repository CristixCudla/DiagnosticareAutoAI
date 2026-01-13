/**
 * LABORATOR 12 - Memory Cache Implementation
 */

export interface ICache {
  get<T>(key: string): T | null
  set(key: string, data: any, ttlSeconds?: number): void
  isSet(key: string): boolean
  remove(key: string): void
  removeByPattern(pattern: string): void
  clear(): void
  getStats(): CacheStats
}

export interface CacheStats {
  totalEntries: number
  hits: number
  misses: number
  hitRate: number
}

interface CacheEntry {
  data: any
  expiry: number
  createdAt: number
  accessCount: number
}

export class MemoryCacheService implements ICache {
  private static instance: MemoryCacheService
  private memoryCache: Map<string, CacheEntry>
  private defaultTTL: number
  private stats: { hits: number; misses: number }

  private constructor(defaultTTL = 300) {
    this.memoryCache = new Map()
    this.defaultTTL = defaultTTL
    this.stats = { hits: 0, misses: 0 }
    console.log(`[MemoryCache] Initialized with default TTL: ${defaultTTL}s`)
    this.startCleanupJob()
  }

  static getInstance(defaultTTL?: number): MemoryCacheService {
    if (!MemoryCacheService.instance) {
      MemoryCacheService.instance = new MemoryCacheService(defaultTTL)
    }
    return MemoryCacheService.instance
  }

  get<T>(key: string): T | null {
    const cached = this.memoryCache.get(key)
    if (!cached) {
      this.stats.misses++
      console.log(`[MemoryCache] MISS: ${key}`)
      return null
    }
    if (Date.now() > cached.expiry) {
      this.memoryCache.delete(key)
      this.stats.misses++
      console.log(`[MemoryCache] EXPIRED: ${key}`)
      return null
    }
    cached.accessCount++
    this.stats.hits++
    console.log(`[MemoryCache] HIT: ${key}`)
    return cached.data as T
  }

  set(key: string, data: any, ttlSeconds?: number): void {
    if (data === null || data === undefined) {
      console.warn(`[MemoryCache] Cannot cache null/undefined for: ${key}`)
      return
    }
    const ttl = ttlSeconds ?? this.defaultTTL
    const expiry = Date.now() + ttl * 1000
    this.memoryCache.set(key, {
      data,
      expiry,
      createdAt: Date.now(),
      accessCount: 0,
    })
    console.log(`[MemoryCache] SET: ${key} (TTL: ${ttl}s)`)
  }

  isSet(key: string): boolean {
    const cached = this.memoryCache.get(key)
    if (!cached) return false
    if (Date.now() > cached.expiry) {
      this.memoryCache.delete(key)
      return false
    }
    return true
  }

  remove(key: string): void {
    const existed = this.memoryCache.delete(key)
    console.log(`[MemoryCache] REMOVE: ${key} - ${existed ? "success" : "not found"}`)
  }

  removeByPattern(pattern: string): void {
    console.log(`[MemoryCache] REMOVE BY PATTERN: ${pattern}`)
    let removedCount = 0
    const regex = new RegExp(pattern.replace(/\*/g, ".*"))
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key)
        removedCount++
      }
    }
    console.log(`[MemoryCache] Removed ${removedCount} entries`)
  }

  clear(): void {
    const size = this.memoryCache.size
    this.memoryCache.clear()
    this.stats = { hits: 0, misses: 0 }
    console.log(`[MemoryCache] CLEAR: Removed ${size} entries`)
  }

  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0
    return {
      totalEntries: this.memoryCache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
    }
  }

  getAllKeys(): string[] {
    return Array.from(this.memoryCache.keys())
  }

  private startCleanupJob(): void {
    if (typeof window === "undefined") {
      setInterval(() => {
        const now = Date.now()
        let cleanedCount = 0
        for (const [key, entry] of this.memoryCache.entries()) {
          if (now > entry.expiry) {
            this.memoryCache.delete(key)
            cleanedCount++
          }
        }
        if (cleanedCount > 0) {
          console.log(`[MemoryCache] Cleanup: Removed ${cleanedCount} expired entries`)
        }
      }, 60000)
    }
  }
}

// Export singleton instance
export const cacheService = MemoryCacheService.getInstance()

// Export class
export const CacheService = MemoryCacheService

// Default export
export default cacheService
