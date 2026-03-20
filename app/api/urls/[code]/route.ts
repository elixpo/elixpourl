import { NextRequest, NextResponse } from 'next/server';
import { resolveUser, auditLog } from '@/lib/auth';
import { getDB, getKV } from '@/lib/db';
import type { UrlRecord } from '@/lib/types';

export const runtime = 'edge';

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const user = await resolveUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { code } = await params;
  const db = getDB();
  const url = await db.prepare('SELECT * FROM urls WHERE short_code = ? AND user_id = ?')
    .bind(code, user.id).first<UrlRecord>();

  if (!url) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(url);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const user = await resolveUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { code } = await params;
  const body: any = await request.json();
  const db = getDB();
  const kv = getKV();

  const url = await db.prepare('SELECT * FROM urls WHERE short_code = ? AND user_id = ?')
    .bind(code, user.id).first<UrlRecord>();
  if (!url) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updates: string[] = [];
  const bindParams: any[] = [];

  if (body.url !== undefined) {
    try { new URL(body.url); } catch { return NextResponse.json({ error: 'Invalid URL' }, { status: 400 }); }
    updates.push('original_url = ?'); bindParams.push(body.url);
  }
  if (body.title !== undefined) { updates.push('title = ?'); bindParams.push(body.title); }
  if (body.is_active !== undefined) { updates.push('is_active = ?'); bindParams.push(body.is_active ? 1 : 0); }
  if (body.expires_at !== undefined) { updates.push('expires_at = ?'); bindParams.push(body.expires_at); }

  if (updates.length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 });

  updates.push("updated_at = datetime('now')");
  bindParams.push(code, user.id);

  await db.prepare(`UPDATE urls SET ${updates.join(', ')} WHERE short_code = ? AND user_id = ?`)
    .bind(...bindParams).run();

  const newUrl = body.url || url.original_url;
  const isActive = body.is_active !== undefined ? body.is_active : !!url.is_active;
  if (isActive) {
    await kv.put(`url:${code}`, JSON.stringify({ url: newUrl, id: url.id }));
  } else {
    await kv.delete(`url:${code}`);
  }

  await auditLog(user.id, 'url.update', 'url', code);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const user = await resolveUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { code } = await params;
  const db = getDB();
  const kv = getKV();

  const url = await db.prepare('SELECT id FROM urls WHERE short_code = ? AND user_id = ?')
    .bind(code, user.id).first();
  if (!url) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await db.prepare('DELETE FROM urls WHERE short_code = ? AND user_id = ?').bind(code, user.id).run();
  await kv.delete(`url:${code}`);
  await auditLog(user.id, 'url.delete', 'url', code);

  return NextResponse.json({ success: true });
}
