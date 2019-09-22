// tslint:disable:no-expression-statement
import test from 'ava';
import hash from 'object-hash';

import { createCache } from './cache';

test('cache - can write to cache', async t => {
  const cache = createCache();

  const cachedValue = { hello: 'world' };

  cache.write(
    {
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
    },
    cachedValue
  );

  t.is(
    await cache.read({
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
    }),
    cachedValue
  );
});

test('cache - fails gracefully', async t => {
  const cache = createCache();

  const value = await cache.read({ query: 'not-exist' });
  t.is(value, undefined);
});

test('cache - fails with exception', async t => {
  const cache = createCache();

  await t.throwsAsync(cache.read({ query: 'not-exist' }, true));
});

test('cache - can pass initial values', async t => {
  const res = { hello: 'world' };

  const cache = createCache({
    values: [[hash({ query: '{ hello }' }), res]]
  });

  const value = await cache.read({ query: '{ hello }' });
  t.is(value, res);
});
