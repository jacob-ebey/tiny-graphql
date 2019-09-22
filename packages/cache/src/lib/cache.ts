import { Cache, CacheKey } from '@tiny-graphql/core';
import hash from 'object-hash';

export interface CreateCacheOptions {
  readonly values?: ReadonlyArray<any>;
}

export function createCache(options?: CreateCacheOptions): Cache {
  const values = new Map<string, any>((options && options.values) || []);

  return {
    read: async <T>(key: CacheKey, throwsIfNotExist?: boolean): Promise<T> => {
      const hashed = hash(key);

      // tslint:disable-next-line: no-if-statement
      if (!values.has(hashed) && throwsIfNotExist) {
        throw new Error('Value does not exist in cache.');
      }

      return values.get(hashed);
    },
    write: (key: CacheKey, value: any): Promise<void> => {
      const hashed = hash(key);
      // tslint:disable-next-line: no-expression-statement
      values.set(hashed, value);

      return Promise.resolve();
    }
  };
}
