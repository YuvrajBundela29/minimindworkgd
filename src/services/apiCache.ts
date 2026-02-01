// API Response Cache with LRU eviction
interface CacheEntry {
  response: string;
  timestamp: number;
  expiresIn: number;
}

class APICache {
  private cache: Map<string, CacheEntry>;
  private maxEntries: number;
  private defaultTTL: number;

  constructor(maxEntries = 50, defaultTTL = 5 * 60 * 1000) {
    this.cache = new Map();
    this.maxEntries = maxEntries;
    this.defaultTTL = defaultTTL;
  }

  generateKey(prompt: string, mode: string, language: string): string {
    // Simple hash function for cache key
    const str = `${prompt.toLowerCase().trim()}_${mode}_${language}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `cache_${Math.abs(hash).toString(16)}`;
  }

  get(key: string): string | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.expiresIn) {
      this.cache.delete(key);
      return null;
    }

    // Move to end for LRU
    this.cache.delete(key);
    this.cache.set(key, entry);
    
    return entry.response;
  }

  set(key: string, response: string, ttl?: number): void {
    // LRU eviction if at capacity
    if (this.cache.size >= this.maxEntries) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      response,
      timestamp: Date.now(),
      expiresIn: ttl ?? this.defaultTTL,
    });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Singleton instance
export const apiCache = new APICache();

export default APICache;
