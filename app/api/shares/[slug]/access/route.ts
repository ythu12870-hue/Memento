import { NextResponse } from 'next/server';
import { getShare, verifySharePassword } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const failedAttempts = new Map<string, { count: number; resetAt: number }>();
function unavailable(share: Awaited<ReturnType<typeof getShare>>) { return !share || Boolean(share.revokedAt) || Boolean(share.expiresAt && Date.parse(share.expiresAt) <= Date.now()); }

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const share = await getShare(slug);
    if (unavailable(share)) return NextResponse.json({ error: 'This share link is unavailable or has expired.' }, { status: 404 });
    return NextResponse.json({ requiresPassword: Boolean(share!.passwordHash), expiresAt: share!.expiresAt });
  } catch (error) {
    console.error('Share check error:', error);
    return NextResponse.json({ error: 'Unable to check this link. Confirm Netlify Blobs is available.' }, { status: 500 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const ip = request.headers.get('x-nf-client-connection-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const attemptKey = `${slug}:${ip}`; const now = Date.now(); const attempt = failedAttempts.get(attemptKey);
    if (attempt && attempt.resetAt > now && attempt.count >= 12) return NextResponse.json({ error: 'Too many password attempts. Please wait 15 minutes and try again.' }, { status: 429 });
    if (attempt && attempt.resetAt <= now) failedAttempts.delete(attemptKey);
    const body = await request.json().catch(() => ({})); const password = typeof body.password === 'string' ? body.password : '';
    const share = await getShare(slug);
    if (unavailable(share)) return NextResponse.json({ error: 'This share link is unavailable or has expired.' }, { status: 404 });
    if (share!.passwordHash && !verifySharePassword(password, share!.passwordHash)) {
      const previous = failedAttempts.get(attemptKey);
      failedAttempts.set(attemptKey, { count: previous && previous.resetAt > now ? previous.count + 1 : 1, resetAt: previous && previous.resetAt > now ? previous.resetAt : now + 15 * 60 * 1000 });
      return NextResponse.json({ error: 'That password is not correct.' }, { status: 401 });
    }
    failedAttempts.delete(attemptKey);
    let html = share!.html;
    if (typeof html !== 'string' || !html.toLowerCase().startsWith('<!doctype html>')) return NextResponse.json({ error: 'This shared experience could not be loaded.' }, { status: 500 });
    const mediaKeys = [...new Set([...html.matchAll(/MEMENTO_MEDIA_PATH:([a-f0-9]{48})/g)].map(match => match[1]))];
    for (const key of mediaKeys) html = html.replaceAll(`MEMENTO_MEDIA_PATH:${key}`, `/api/shares/media/${key}`);
    return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'self' https: data: blob: 'unsafe-inline' 'unsafe-eval'; frame-ancestors 'self'" } });
  } catch (error) {
    console.error('Share access error:', error);
    return NextResponse.json({ error: 'Unable to open this share. Confirm Netlify Blobs is available.' }, { status: 500 });
  }
}
