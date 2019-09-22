export interface CacheKey {
	readonly query: string;
	readonly variables?: { readonly [key: string]: any };
}

export interface Cache {
	readonly read: <T>(key: CacheKey, throwsIfNotExist?: boolean) => Promise<T>;
	readonly write: (key: CacheKey, value: any) => Promise<void>;
}
