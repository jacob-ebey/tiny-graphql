# Tiny GraphQL

A tiny GraphQL suite for making your dev and user experience better than ever.

## Truly tiny

**Core**

https://www.npmjs.com/package/@tiny-graphql/core

![core](https://badgen.net/bundlephobia/minzip/@tiny-graphql/core)

Everything you need to get going query for data and perform mutations lives in it's own package.

**Cache**

https://www.npmjs.com/package/@tiny-graphql/cache

![cache](https://badgen.net/bundlephobia/minzip/@tiny-graphql/cache)

For more advanced use-cases caching may be wanted and can easily be added by including the package.

## Installation

```shell
> npm install -s @tiny-graphql/core
```

Optionaly install the cache as well

```shell
> npm install -s @tiny-graphql/core @tiny-graphql/cache
```

## Usage

```typescript
import { createClient } from '@tiny-graphql/core';
import { createCache } from '@tiny-graphql/cache'; // Optional

const client = createClient({
  cache: createCache(), // Optional
  url: '<YOUR_URL>'
});

async function sayHello(name: string): string {
  const result = await client.execute<{ hello?: string }>({
    query: `
      query SayHello($name: String) {
        hello(name: $name)
      }
    `,
    variables: {
      name: 'World'
    }
  });

  if (result.errors || !result.data) {
    throw new Error('Could not say hello');
  }

  return result.data.hello;
}
```

