import { NextRequest, NextResponse } from 'next/server';
import { resolveUser, auditLog } from '@/lib/auth';
import { getDB, getKV, getEnv } from '@/lib/db';
import { generateShortCode } from '@/lib/utils';
import { TIER_LIMITS, type UrlRecord } from '@/lib/types';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  const user = await resolveUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body: any = await request.json();
  const { url, custom_code, title, expires_at } = body;
  const limits = TIER_LIMITS[user.tier];
  const db = getDB();
  const kv = getKV();
  const env = getEnv();

  if (!url) return NextResponse.json({ error: 'url is required' }, { status: 400 });
  try { new URL(url); } catch { return NextResponse.json({ error: 'Invalid URL' }, { status: 400 }); }

  // Check URL limit
  if (limits.maxUrls !== -1) {
    const count = await db.prepare('SELECT COUNT(*) as count FROM urls WHERE user_id = ?')
      .bind(user.id).first<{ count: number }>();
    if ((count?.count || 0) >= limits.maxUrls) {
      return NextResponse.json({ error: `URL limit reached (${limits.maxUrls} for ${user.tier} tier)` }, { status: 403 });
    }
  }

  if (custom_code && !limits.customCodes) {
    return NextResponse.json({ error: 'Custom short codes require Pro tier or above' }, { status: 403 });
  }
  if (expires_at && !limits.expiringLinks) {
    return NextResponse.json({ error: 'Expiring links require Pro tier or above' }, { status: 403 });
  }

  const shortCode = custom_code || generateShortCode();

  if (custom_code) {
    if (!/^[a-zA-Z0-9_-]+$/.test(custom_code)) {
      return NextResponse.json({ error: 'Custom code must be alphanumeric, hyphens, or underscores' }, { status: 400 });
    }
    if (custom_code.length < 3 || custom_code.length > 32) {
      return NextResponse.json({ error: 'Custom code must be 3-32 characters' }, { status: 400 });
    }
    const existing = await db.prepare('SELECT id FROM urls WHERE short_code = ?').bind(shortCode).first();
    if (existing) return NextResponse.json({ error: 'Short code already taken' }, { status: 409 });
  }

  const result = await db
    .prepare('INSERT INTO urls (user_id, short_code, original_url, title, expires_at) VALUES (?, ?, ?, ?, ?) RETURNING *')
    .bind(user.id, shortCode, url, title || null, expires_at || null)
    .first<UrlRecord>();

  // Cache in KV
  const kvValue = JSON.stringify({ url, id: result!.id });
  const ttl = expires_at ? Math.max(Math.floor((new Date(expires_at).getTime() - Date.now()) / 1000), 60) : undefined;
  await kv.put(`url:${shortCode}`, kvValue, { expirationTtl: ttl });

  await auditLog(user.id, 'url.create', 'url', shortCode, url);

  return NextResponse.json({
    short_url: `${env.BASE_URL}/${shortCode}`,
    short_code: shortCode,
    original_url: url,
    title: result?.title,
    created_at: result?.created_at,
    expires_at: result?.expires_at,
  }, { status: 201 });
}

export async function GET(request: NextRequest) {
  const user = await resolveUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDB();
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
  const offset = parseInt(url.searchParams.get('offset') || '0');
  const search = url.searchParams.get('search') || '';

  let query = 'SELECT * FROM urls WHERE user_id = ?';
  const params: any[] = [user.id];

  if (search) {
    query += ' AND (short_code LIKE ? OR original_url LIKE ? OR title LIKE ?)';
    const like = `%${search}%`;
    params.push(like, like, like);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const { results } = await db.prepare(query).bind(...params).all<UrlRecord>();
  const total = await db.prepare('SELECT COUNT(*) as count FROM urls WHERE user_id = ?')
    .bind(user.id).first<{ count: number }>();

  return NextResponse.json({ urls: results, total: total?.count || 0, limit, offset });
}
