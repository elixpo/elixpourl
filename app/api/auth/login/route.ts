import { NextRequest, NextResponse } from 'next/server';
import { getAuthorizeUrl } from '@/lib/auth';
import { getKV } from '@/lib/db';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const state = crypto.randomUUID();
  const kv = getKV();
  await kv.put(`oauth_state:${state}`, '1', { expirationTtl: 600 });
  return NextResponse.redirect(getAuthorizeUrl(state, request.url));
}
