import { NextRequest, NextResponse } from 'next/server';
import { resolveUser, auditLog } from '@/lib/auth';
import { getDB } from '@/lib/db';
import { generateApiKey, hashApiKey } from '@/lib/utils';
import { TIER_LIMITS } from '@/lib/types';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  const user = await resolveUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, scopes, expires_at } = await request.json();
  const limits = TIER_LIMITS[user.tier];
  const db = getDB();

  if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 });

  const keyCount = await db.prepare('SELECT COUNT(*) as count FROM api_keys WHERE user_id = ? AND is_active = 1')
    .bind(user.id).first<{ count: number }>();

  if ((keyCount?.count || 0) >= limits.maxApiKeys) {
    return NextResponse.json({ error: `API key limit reached (${limits.maxApiKeys} for ${user.tier} tier)` }, { status: 403 });
  }

  const rawKey = generateApiKey();
  const keyHash = await hashApiKey(rawKey);
  const keyPrefix = rawKey.slice(0, 8);

  await db.prepare('INSERT INTO api_keys (user_id, key_hash, key_prefix, name, scopes, expires_at) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(user.id, keyHash, keyPrefix, name, scopes || 'read,write', expires_at || null).run();

  await auditLog(user.id, 'apikey.create', 'api_key', keyPrefix);

  return NextResponse.json({ key: rawKey, prefix: keyPrefix, name, scopes: scopes || 'read,write' }, { status: 201 });
}

export async function GET(request: NextRequest) {
  const user = await resolveUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDB();
  const { results } = await db.prepare(
    'SELECT id, key_prefix, name, scopes, last_used_at, expires_at, is_active, created_at FROM api_keys WHERE user_id = ? ORDER BY created_at DESC'
  ).bind(user.id).all();

  return NextResponse.json({ keys: results });
}
