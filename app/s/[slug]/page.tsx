'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function SharedExperiencePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [checking, setChecking] = useState(true);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [html, setHtml] = useState('');
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/shares/${encodeURIComponent(slug)}/access`, { cache: 'no-store' })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'This link is unavailable.');
        if (!active) return;
        setRequiresPassword(Boolean(data.requiresPassword));
        if (!data.requiresPassword) void openShare('');
      })
      .catch(reason => { if (active) setError(reason instanceof Error ? reason.message : 'This link is unavailable.'); })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
    // The slug is stable for this route; openShare is intentionally not a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function openShare(pass: string) {
    setOpening(true); setError('');
    try {
      const response = await fetch(`/api/shares/${encodeURIComponent(slug)}/access`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pass }), cache: 'no-store',
      });
      const contentType = response.headers.get('content-type') || '';
      if (!response.ok) {
        const data = contentType.includes('application/json') ? await response.json() : null;
        throw new Error(data?.error || 'Could not open this memory.');
      }
      if (!contentType.includes('text/html')) throw new Error('The shared memory returned an unexpected response.');
      setHtml(await response.text());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not open this memory.');
    } finally { setOpening(false); }
  }

  function submit(event: FormEvent) { event.preventDefault(); void openShare(password); }

  if (html) return <main style={{ position: 'fixed', inset: 0, background: '#f5f2ff' }}><iframe title="Shared Memento experience" srcDoc={html} sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock" allow="autoplay" style={{ border: 0, width: '100%', height: '100%' }} /></main>;

  return <main className="share-gate-shell"><section className="share-gate-card"><div className="share-gate-mark">m</div><div className="share-gate-overline">A LITTLE MEMORY, MADE WITH CARE</div><h1>{requiresPassword ? 'A private surprise awaits' : 'A little surprise awaits'}</h1><p>{requiresPassword ? 'This memory is password-protected. Enter the password shared with you to open it.' : 'Preparing your shared memory…'}</p>
    {checking && <div className="share-gate-spinner" aria-label="Loading" />}
    {!checking && requiresPassword && <form onSubmit={submit} className="share-gate-form"><label htmlFor="share-password">Password</label><input id="share-password" type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" maxLength={128} required autoFocus/><button type="submit" disabled={opening}>{opening ? 'Opening…' : 'Open memory'} <span>→</span></button></form>}
    {!checking && !requiresPassword && !html && !error && <button className="share-gate-button" onClick={() => void openShare('')} disabled={opening}>{opening ? 'Opening…' : 'Open memory'} <span>→</span></button>}
    {error && <p className="share-gate-error" role="alert">{error}</p>}
    <div className="share-gate-foot">Thoughtfully made with Memento</div></section></main>;
}
