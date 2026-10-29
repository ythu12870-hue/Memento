import { NextResponse } from 'next/server';
import { mediaStore } from '@/lib/supabase-server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(_request: Request, context: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await context.params;
    if (!/^[a-f0-9]{48}$/.test(key)) return NextResponse.json({ error: 'Media not found.' }, { status: 404 });
    const result = await mediaStore().getWithMetadata(key, { type: 'arrayBuffer' });
    if (!result || result.data === null) return NextResponse.json({ error: 'Media not found.' }, { status: 404 });
    const contentType = typeof result.metadata?.contentType === 'string' ? result.metadata.contentType : 'application/octet-stream';
    return new NextResponse(result.data, { headers: { 'Content-Type': contentType, 'Cache-Control': 'private, max-age=300', 'X-Content-Type-Options': 'nosniff', 'Content-Disposition': 'inline' } });
  } catch (error) {
    console.error('Media read error:', error);
    return NextResponse.json({ error: 'Could not load media.' }, { status: 500 });
  }
}
