'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { profile } from '@/lib/content';
import { Icon } from './ui';

export function ContactForm() {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    if (!profile.contactEndpoint) {
      const text = String(values.topic) + '\n\n' + String(values.message) + '\n\n' + String(values.name) + '\n' + String(values.email);
      setDraft(text);
      if (profile.email) {
        window.location.href = 'mailto:' + profile.email + '?subject=' + encodeURIComponent(String(values.topic)) + '&body=' + encodeURIComponent(text);
        setStatus('Your email app will open with the draft.');
      } else setStatus('Your draft is ready to copy into a LinkedIn message.');
      return;
    }
    setBusy(true);
    setStatus('');
    try {
      const response = await fetch(profile.contactEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values), signal: AbortSignal.timeout(12000) });
      if (!response.ok) throw new Error();
      setStatus('Your inquiry was received.');
      form.reset();
    } catch { setStatus('The inquiry could not be submitted. Please retry or reach out on LinkedIn.'); }
    finally { setBusy(false); }
  }

  return <form className="contact-form" onSubmit={submit}>
    <div className="contact-row"><label className="field"><span>Name</span><input name="name" autoComplete="name" maxLength={100} required /></label><label className="field"><span>Email</span><input name="email" type="email" autoComplete="email" maxLength={250} required /></label></div>
    <label className="field"><span>What would you like to discuss?</span><select name="topic"><option>AI engineering</option><option>Data science</option><option>Technical collaboration</option><option>Consulting</option><option>Professional opportunities</option><option>Something else</option></select></label>
    <label className="field"><span>Message</span><textarea name="message" rows={4} minLength={10} maxLength={3000} required /></label>
    <label className="honeypot" aria-hidden="true">Leave blank<input name="website" tabIndex={-1} autoComplete="off" /></label>
    <button className="button primary" type="submit" disabled={busy}>{busy ? 'Submitting…' : profile.contactEndpoint ? 'Send inquiry' : 'Prepare message'} <Icon name="up" size={17} /></button>
    {status && <p role="status">{status}</p>}
    {draft && <div className="message-draft"><label className="field"><span>Message draft</span><textarea value={draft} rows={4} readOnly /></label><div className="filters"><button type="button" className="chip" onClick={async () => { try { await navigator.clipboard.writeText(draft); setStatus('Draft copied.'); } catch { setStatus('Select the draft text to copy it.'); } }}>Copy draft</button><a className="text-link" href={profile.linkedin} target="_blank" rel="noreferrer">Open LinkedIn <Icon name="up" size={15} /></a></div></div>}
  </form>;
}

export function PerformanceReporter() {
  useEffect(() => {
    const endpoint = profile.analyticsEndpoint;
    if (!endpoint || navigator.doNotTrack === '1' || !('PerformanceObserver' in window)) return;
    const observer = new PerformanceObserver(list => {
      const entry = list.getEntries().at(-1);
      if (entry) navigator.sendBeacon(endpoint, new URLSearchParams({ metric: 'LCP', ms: String(Math.round(entry.startTime)), route: location.pathname }));
    });
    if (PerformanceObserver.supportedEntryTypes.includes('largest-contentful-paint')) observer.observe({ type: 'largest-contentful-paint', buffered: true });
    return () => observer.disconnect();
  }, []);
  return null;
}
