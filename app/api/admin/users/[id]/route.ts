import { NextRequest, NextResponse } from 'next/server';
import { resolveUser, auditLog } from '@/lib/auth';
import { getDB } from '@/lib/db';

export const runtime = 'edge';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await resolveUser(request);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const userId = parseInt(id);
  const body = await request.json();
  const db = getDB();

  if (body.role === 'admin') {
    const adminCount = await db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'")
      .first<{ count: number }>();
    if ((adminCount?.count || 0) >= 15) {
      return NextResponse.json({ error: 'Maximum admin accounts (15) reached' }, { status: 400 });
    }
  }

  const updates: string[] = [];
  const bindParams: any[] = [];
  if (body.role !== undefined) { updates.push('role = ?'); bindParams.push(body.role); }
  if (body.tier !== undefined) { updates.push('tier = ?'); bindParams.push(body.tier); }
  if (body.is_active !== undefined) { updates.push('is_active = ?'); bindParams.push(body.is_active ? 1 : 0); }

  if (updates.length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 });

  bindParams.push(userId);
  await db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).bind(...bindParams).run();
  await auditLog(user.id, 'admin.user.update', 'user', String(userId), JSON.stringify(body));

  return NextResponse.json({ success: true });
}
