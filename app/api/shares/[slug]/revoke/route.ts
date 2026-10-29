import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { getShare, saveShare, sha256 } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const body = await request.json().catch(() => ({}));
    const ownerToken = typeof body.ownerToken === 'string' ? body.ownerToken : '';
    if (!ownerToken || ownerToken.length > 200) return NextResponse.json({ error: 'The link management token is missing.' }, { status: 401 });
    const share = await getShare(slug);
    if (!share) return NextResponse.json({ error: 'Could not find this share.' }, { status: 404 });
    const actualHash = Buffer.from(sha256(ownerToken), 'hex'); const expectedHash = Buffer.from(share.ownerTokenHash || '', 'hex');
    if (!share.ownerTokenHash || actualHash.length !== expectedHash.length || !timingSafeEqual(actualHash, expectedHash)) return NextResponse.json({ error: 'You do not have permission to revoke this link.' }, { status: 403 });
    share.revokedAt = new Date().toISOString(); await saveShare(share);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Share revoke error:', error);
    return NextResponse.json({ error: 'Could not revoke this link. Confirm Netlify Blobs is available.' }, { status: 500 });
  }
}
