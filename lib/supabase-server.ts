import { getStore } from '@netlify/blobs';
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

/** Netlify Blobs replaces the former Supabase database and Storage integration. */
export type ShareRecord = {
  slug: string;
  html: string;
  passwordHash: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  ownerTokenHash: string;
  createdAt: string;
};

export function shareStore() { return getStore('memento-shares'); }
export function mediaStore() { return getStore('memento-media'); }
export function randomSlug() { return randomBytes(9).toString('base64url'); }
export function randomMediaKey() { return randomBytes(24).toString('hex'); }
export function sha256(value: string) { return createHash('sha256').update(value).digest('hex'); }
export function hashSharePassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  return `scrypt$${salt}$${scryptSync(password, salt, 64).toString('hex')}`;
}
export function verifySharePassword(password: string, stored: string) {
  const [scheme, salt, digest] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !digest) return false;
  try {
    const expected = Buffer.from(digest, 'hex');
    const actual = scryptSync(password, salt, expected.length);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch { return false; }
}
export function safeObjectName(name: string, mimeType: string) {
  const extByType: Record<string, string> = {
    'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif',
    'video/mp4': '.mp4', 'video/webm': '.webm', 'audio/mpeg': '.mp3', 'audio/mp4': '.m4a',
    'audio/ogg': '.ogg', 'audio/wav': '.wav', 'audio/webm': '.webm',
  };
  const cleaned = name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80) || 'media';
  return cleaned.includes('.') ? cleaned : `${cleaned}${extByType[mimeType] || ''}`;
}
export async function getShare(slug: string): Promise<ShareRecord | null> {
  return await shareStore().get(slug, { type: 'json' }) as ShareRecord | null;
}
export async function saveShare(record: ShareRecord) {
  await shareStore().setJSON(record.slug, record);
}
