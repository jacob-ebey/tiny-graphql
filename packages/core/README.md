# Tiny GraphQL Core ![core](https://badgen.net/bundlephobia/minzip/@tiny-graphql/core)

A tiny GraphQL client for making your dev experience better than ever.

## Usage

```typescript
import { createClient } from '@tiny-graphql/core';

const client = createClient({
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
