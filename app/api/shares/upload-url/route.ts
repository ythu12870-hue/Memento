import { NextResponse } from 'next/server';
import { mediaStore, randomMediaKey } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const allowedTypes = new Set(['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','audio/mpeg','audio/mp4','audio/ogg','audio/wav','audio/webm']);
const MAX_MEDIA_BYTES = 5 * 1024 * 1024;

// First request prepares an opaque media key; second request uploads bytes to this route.
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    if (key) {
      if (!/^[a-f0-9]{48}$/.test(key)) return NextResponse.json({ error: 'Invalid upload key.' }, { status: 400 });
      const mimeType = request.headers.get('content-type')?.split(';')[0].trim() || '';
      if (!allowedTypes.has(mimeType)) return NextResponse.json({ error: 'Unsupported media type.' }, { status: 400 });
      const bytes = await request.arrayBuffer();
      if (!bytes.byteLength || bytes.byteLength > MAX_MEDIA_BYTES) return NextResponse.json({ error: 'Each media file must be 5 MB or smaller for reliable serverless uploads.' }, { status: 413 });
      await mediaStore().set(key, bytes, { metadata: { contentType: mimeType } });
      return NextResponse.json({ success: true });
    }
    const body = await request.json();
    const mimeType = typeof body.mimeType === 'string' ? body.mimeType : '';
    if (!allowedTypes.has(mimeType)) return NextResponse.json({ error: 'Unsupported media type.' }, { status: 400 });
    const uploadKey = randomMediaKey();
    return NextResponse.json({ uploadUrl: `/api/shares/upload-url?key=${uploadKey}`, path: uploadKey, mimeType });
  } catch (error) {
    console.error('Netlify media upload error:', error);
    return NextResponse.json({ error: 'Could not upload media. Run this project with Netlify Dev and check your Netlify site connection.' }, { status: 500 });
  }
}
