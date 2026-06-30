class MemoryCache {
  constructor(maxEntries = 500) {
    this.cache = new Map();
    this.maxEntries = maxEntries;

    // Periodic cleanup of expired entries every 5 minutes
    this._cleanupInterval = setInterval(() => this._cleanup(), 5 * 60 * 1000);
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // Check if key has expired
    if (entry.expiry && entry.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value, ttlSeconds = null) {
    // Evict oldest entry if at capacity
    if (this.cache.size >= this.maxEntries && !this.cache.has(key)) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    const expiry = ttlSeconds ? Date.now() + (ttlSeconds * 1000) : null;
    this.cache.set(key, { value, expiry });
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  _cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (entry.expiry && entry.expiry < now) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instances
export const poolCache = new MemoryCache(200);     // Up to 200 exam+subject pools
export const userSeenCache = new MemoryCache(1000); // Up to 1000 user seen-question sets
