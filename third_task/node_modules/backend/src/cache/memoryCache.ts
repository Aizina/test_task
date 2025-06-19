interface CacheEntry<T> {
  data: T;
  timer: NodeJS.Timeout;
}

const cache = new Map<string, CacheEntry<any>>();

export function set<T>(key: string, value: T, ttl: number): void {
  if (cache.has(key)) {
    clearTimeout(cache.get(key)!.timer);
  }

  const timer = setTimeout(() => {
    cache.delete(key);
  }, ttl * 1000);

  cache.set(key, { data: value, timer });
}

export function get<T>(key: string): T | null {
  const entry = cache.get(key);
  return entry ? entry.data : null;
}
