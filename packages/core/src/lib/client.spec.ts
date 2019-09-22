// tslint:disable:no-object-mutation
// tslint:disable:no-expression-statement
import test from 'ava';
import hash from 'object-hash';

import { Cache, CacheKey } from './cache';
import { createClient } from './client';

export function createCache(): Cache {
  const values = new Map<string, any>();

  return {
    clear: () => {
      values.clear();
      return Promise.resolve();
    },
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

// tslint:disable-next-line: typedef
function createMockFetch(result: any) {
  const meta = {
    called: 0,
    calledWith: [] as any
  };

  return {
    fetch: async (...params: any): Promise<any> => {
      meta.called = meta.called + 1;
      meta.calledWith.push(params);

      return {
        json: () => Promise.resolve(result)
      };
    },
    getMeta: () => meta
  };
}

test('client - can use provided fetch', async t => {
  const res = { data: { hello: 'world' } };
  const mock = createMockFetch(res);
  const client = createClient({
    fetch: mock.fetch,
    url: 'https://not-real-api-this-is-fake.com/'
  });

  const result = await client.execute<any>({
    query: `{ hello }`
  });

  t.is(result, res);

  const meta = mock.getMeta();
  t.is(meta.called, 1);
});

test('client - pulls data from cache', async t => {
  const res = { data: { hello: 'world' } };
  const mock = createMockFetch(res);
  const client = createClient({
    cache: createCache(),
    fetch: mock.fetch,
    url: 'https://not-real-api-this-is-fake.com/'
  });

  const result = await client.execute<any>({
    query: `{ hello }`
  });

  const result2 = await client.execute<any>({
    query: `{ hello }`
  });

  t.is(result, res);
  t.is(result2, res);

  t.is(mock.getMeta().called, 1);
});

test('client - can skip cache', async t => {
  const res = { data: { hello: 'world' } };
  const mock = createMockFetch(res);
  const client = createClient({
    cache: createCache(),
    fetch: mock.fetch,
    url: 'https://not-real-api-this-is-fake.com/'
  });

  const result = await client.execute<any>({
    query: `{ hello }`
  });

  const result2 = await client.execute<any>({
    query: `{ hello }`,
    skipCache: true
  });

  t.is(result, res);
  t.is(result2, res);

  t.is(mock.getMeta().called, 2);
});

test('client - can execute query', async t => {
  const client = createClient({
    url: 'https://countries.trevorblades.com/'
  });

  const result = await client.execute<any>({
    query: `
    query Country($code: String) {
      country(code: $code) {
        name
        phone
        currency
        languages {
          code
          name
        }
      }
    }
    `,
    variables: {
      code: 'US'
    }
  });

  t.falsy(result.errors);
  t.truthy(result);
  t.truthy(result.data);
  t.truthy(result.data.country);
  t.truthy(result.data.country.name);
  t.truthy(result.data.country.phone);
  t.truthy(result.data.country.currency);
  t.truthy(result.data.country.languages);
  t.true(Array.isArray(result.data.country.languages));
  t.truthy(result.data.country.languages[0].code);
  t.truthy(result.data.country.languages[0].name);
});
