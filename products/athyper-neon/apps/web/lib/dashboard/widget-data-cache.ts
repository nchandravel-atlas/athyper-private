/**
 * In-flight request deduplication and TTL cache for widget data fetches.
 *
 * - Coalesces concurrent requests for the same cache key (in-flight dedup)
 * - Caches results for a configurable TTL (default 30s)
 * - Supports manual cache invalidation
 */

const DEFAULT_TTL_MS = 30_000;

interface CacheEntry<T> {
    data: T;
    expiresAt: number;
}

// Module-level singletons
const cache = new Map<string, CacheEntry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();

/**
 * Build a cache key from entity + suffix.
 */
export function buildCacheKey(entity: string, suffix: string): string {
    return `${entity}:${suffix}`;
}

/**
 * Fetch with in-flight deduplication and TTL caching.
 *
 * If a request for the same key is already in-flight, returns the same promise.
 * If a cached result exists and is not expired, returns it immediately.
 */
export async function cachedFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs: number = DEFAULT_TTL_MS,
): Promise<T> {
    // 1. Check TTL cache
    const cached = cache.get(key) as CacheEntry<T> | undefined;
    if (cached && cached.expiresAt > Date.now()) {
        return cached.data;
    }

    // 2. Check in-flight (coalesce)
    const existing = inFlight.get(key);
    if (existing) {
        return existing as Promise<T>;
    }

    // 3. Execute and coalesce
    const promise = fetcher()
        .then((result) => {
            cache.set(key, { data: result, expiresAt: Date.now() + ttlMs });
            inFlight.delete(key);
            return result;
        })
        .catch((err) => {
            inFlight.delete(key);
            throw err;
        });

    inFlight.set(key, promise);
    return promise;
}

/**
 * Invalidate cache entries matching a prefix. If no prefix, clears all.
 */
export function invalidateCache(prefix?: string): void {
    if (!prefix) {
        cache.clear();
        return;
    }
    for (const key of cache.keys()) {
        if (key.startsWith(prefix)) {
            cache.delete(key);
        }
    }
}

/**
 * Get cache stats for diagnostics.
 */
export function getCacheStats(): { cacheSize: number; inFlightCount: number } {
    return {
        cacheSize: cache.size,
        inFlightCount: inFlight.size,
    };
}
