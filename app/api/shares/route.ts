import { NextResponse } from 'next/server';
import { hashSharePassword, randomSlug, saveShare, sha256 } from '@/lib/supabase-server';
import { randomBytes } from 'node:crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const MAX_HTML_LENGTH = 1_500_000;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const html = typeof body.html === 'string' ? body.html : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const expiryHours = body.expiryHours === null ? null : Number(body.expiryHours ?? 0);
    if (!html.toLowerCase().startsWith('<!doctype html>') || html.length > MAX_HTML_LENGTH) return NextResponse.json({ error: 'The experience is too large to publish or is invalid. Reduce media size and try again.' }, { status: 413 });
    if (password.length > 128 || (password && password.length < 4)) return NextResponse.json({ error: 'Use a password between 4 and 128 characters.' }, { status: 400 });
    if (expiryHours !== null && (!Number.isFinite(expiryHours) || expiryHours < 1 || expiryHours > 8760)) return NextResponse.json({ error: 'Expiry must be between 1 hour and 1 year, or set to never expire.' }, { status: 400 });
    const slug = randomSlug();
    const ownerToken = randomBytes(32).toString('base64url');
    const expiresAt = expiryHours === null ? null : new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString();
    await saveShare({ slug, html, passwordHash: password ? hashSharePassword(password) : null, expiresAt, revokedAt: null, ownerTokenHash: sha256(ownerToken), createdAt: new Date().toISOString() });
    return NextResponse.json({ slug, url: `${new URL(request.url).origin}/s/${slug}`, expiresAt, ownerToken });
  } catch (error) {
    console.error('Share publish error:', error);
    return NextResponse.json({ error: 'Could not publish this experience. Confirm the site is running with Netlify Dev and Netlify Blobs is available.' }, { status: 500 });
  }
}
