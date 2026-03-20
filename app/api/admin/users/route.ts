import { NextRequest, NextResponse } from 'next/server';
import { resolveUser } from '@/lib/auth';
import { getDB } from '@/lib/db';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const user = await resolveUser(request);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const db = getDB();
  const { results } = await db.prepare(
    `SELECT u.*, COUNT(url.id) as url_count FROM users u
     LEFT JOIN urls url ON u.id = url.user_id
     GROUP BY u.id ORDER BY u.created_at DESC`
  ).all();

  return NextResponse.json({ users: results });
}
