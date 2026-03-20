import { getRequestContext } from '@cloudflare/next-on-pages';

export function getDB(): D1Database {
  return getRequestContext().env.DB;
}

export function getKV(): KVNamespace {
  return getRequestContext().env.KV;
}

export function getEnv() {
  const ctx = getRequestContext().env;
  return {
    DB: ctx.DB as D1Database,
    KV: ctx.KV as KVNamespace,
    NEXT_PUBLIC_ELIXPO_CLIENT_ID: (ctx as any).NEXT_PUBLIC_ELIXPO_CLIENT_ID || process.env.NEXT_PUBLIC_ELIXPO_CLIENT_ID || '',
    NEXT_PUBLIC_ELIXPO_CLIENT_SECRET: (ctx as any).NEXT_PUBLIC_ELIXPO_CLIENT_SECRET || process.env.NEXT_PUBLIC_ELIXPO_CLIENT_SECRET || '',
    NEXT_PUBLIC_ELIXPO_REDIRECT_URI: (ctx as any).NEXT_PUBLIC_ELIXPO_REDIRECT_URI || process.env.NEXT_PUBLIC_ELIXPO_REDIRECT_URI || '',
    BASE_URL: (ctx as any).BASE_URL || process.env.BASE_URL || '',
  };
}
