import type { AppType } from 'api';
import { hc, type InferRequestType, type InferResponseType } from 'hono/client';

// Pre-computed client type for better IDE performance
export type ApiClient = ReturnType<typeof hc<AppType>>;

/**
 * Create a typed API client for the backend.
 * The type is pre-computed at compile time for better IDE performance.
 */
export function createApiClient(baseUrl: string, options?: Parameters<typeof hc>[1]): ApiClient {
  return hc<AppType>(baseUrl, {
    init: {
      credentials: 'include',
    },
    ...options,
  });
}

// Re-export useful types
export type { AppType, InferRequestType, InferResponseType };
