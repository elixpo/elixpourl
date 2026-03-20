import { getRequestContext } from '@cloudflare/next-on-pages';

export function getDB(): D1Database {
  return getRequestContext().env.DB;
}

export function getKV(): KVNamespace {
  return getRequestContext().env.KV;
}

export function getEnv() {
  return getRequestContext().env as {
    DB: D1Database;
    KV: KVNamespace;
    OAUTH_CLIENT_ID: string;
    OAUTH_CLIENT_SECRET: string;
    OAUTH_REDIRECT_URI: string;
    BASE_URL: string;
  };
}
