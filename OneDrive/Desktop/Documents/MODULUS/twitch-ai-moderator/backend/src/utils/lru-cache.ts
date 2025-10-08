import { LRUCache } from 'lru-cache';

export function createMessageCache<T>() {
  return new LRUCache<string, T>({
    max: 10000,
    ttl: 120000, // 2 minutes
    updateAgeOnGet: false,
    updateAgeOnHas: false
  });
}