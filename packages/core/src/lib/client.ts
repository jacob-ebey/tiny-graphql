import fetch from 'isomorphic-unfetch';

import { Cache } from './cache';

export interface ClientExecuteOptons {
  readonly headers?: HeadersInit;
  readonly query: string;
  readonly skipCache?: boolean;
  readonly variables?: { readonly [key: string]: any };
}

export interface ClientExecuteResult<T> {
  readonly data?: T;
  readonly errors?: ReadonlyArray<any>;
}

export interface Client {
  readonly cache?: Cache;
  readonly execute: <T = any>(
    options: ClientExecuteOptons
  ) => Promise<ClientExecuteResult<T>>;
}

export interface CreateClientOptions {
  readonly cache?: Cache;
  readonly fetch?: typeof fetch;
  readonly headers?: HeadersInit;
  readonly url: string;
}

export function createClient(options: CreateClientOptions): Client {
  return {
    cache: options.cache,
    execute: async <T = any>(
      executeOptions: ClientExecuteOptons
    ): Promise<ClientExecuteResult<T>> => {
      return ((options.cache &&
        !executeOptions.skipCache &&
        (await options.cache.read({
          query: executeOptions.query,
          variables: executeOptions.variables
        }))) ||
        (options.fetch || fetch)(options.url, {
          body: JSON.stringify({
            query: executeOptions.query,
            variables: executeOptions.variables
          }),
          headers: {
            ...(options.headers || {}),
            ...(executeOptions.headers || {}),
            'Content-Type': 'application/json'
          },
          method: 'POST'
        })
          .then(res => res.json())
          .then(
            json =>
              new Promise((resolve, reject) => {
                // tslint:disable-next-line: no-if-statement
                if (options.cache && json) {
                  // tslint:disable-next-line: no-expression-statement
                  options.cache
                    .write(
                      {
                        query: executeOptions.query,
                        variables: executeOptions.variables
                      },
                      json
                    )
                    .then(() => resolve(json))
                    .catch(reject);
                } else {
                  // tslint:disable-next-line: no-expression-statement
                  resolve(json);
                }
              })
          )) as ClientExecuteResult<T>;
    }
  };
}
