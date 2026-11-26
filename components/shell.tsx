'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { localAsset, profile, projects, notes, resumeFilename, skills } from '@/lib/content';
import { Icon } from './ui';

const nav = [['Work', 'work'], ['Expertise', 'expertise'], ['The Lab', 'lab'], ['About', 'about']];
const commands = [
  { text: 'Explore AI projects', caption: 'Case study collection', href: '/#work' },
  { text: 'View Data Engineering', caption: 'Lakehouse case study', href: '/work/lakehouse/' },
  { text: 'Open Résumé', caption: 'Public PDF', asset: profile.resume },
  { text: 'Search Skills', caption: 'Technology and project evidence', href: '/#expertise' },
  { text: 'Explore The Lab', caption: 'Interactive experiments', href: '/#lab' },
  { text: 'Change Theme', caption: 'Display preference', theme: true },
  { text: 'Contact Me', caption: 'Professional inquiries', href: '/#contact' },
];

export function Header() {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [mobile, setMobile] = useState(false);
  const [active, setActive] = useState('work');
  const [theme, setTheme] = useState('dark');

  function changeTheme() {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try { localStorage.setItem('portfolio-theme', next); } catch {}
  }

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme || 'dark');
    const keydown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setQuery('');
        if (dialog.current?.open) dialog.current.close();
        else { dialog.current?.showModal(); search.current?.focus(); }
      }
    };
    const hashChanged = () => setActive(window.location.hash.slice(1) || 'work');
    hashChanged();
    window.addEventListener('keydown', keydown);
    window.addEventListener('hashchange', hashChanged);
    return () => {
      window.removeEventListener('keydown', keydown);
      window.removeEventListener('hashchange', hashChanged);
    };
  }, []);

  const entries = [
    ...commands,
    ...projects.map(p => ({ text: p.title, caption: p.domain, href: '/work/' + p.id + '/' })),
    ...skills.map(s => ({ text: s.name, caption: s.domain + ' · ' + s.level, href: '/?skill=' + encodeURIComponent(s.name) + '#expertise' })),
    ...notes.map(n => ({ text: n.title, caption: n.topic, href: '/notes/' + n.slug + '/' })),
  ];
  const results = query.trim() ? entries.filter(entry => (entry.text + ' ' + entry.caption).toLowerCase().includes(query.trim().toLowerCase())).slice(0, 12) : commands;

  return <header className="site-header">
    <div className="header-inner">
      <Link href="/" className="wordmark">
        <span className="brand-mark" aria-hidden="true"><span>m</span><span>m</span><i /></span>
        <span>MOATASEM<span className="brand-last"> MOHAMMED</span></span>
      </Link>
      <nav className={mobile ? 'main-nav open' : 'main-nav'} aria-label="Main navigation">
        {nav.map(([label, id]) => <Link key={id} href={'/#' + id} className={(pathname.startsWith('/work/') && id === 'work') || (pathname === '/' && active === id) ? 'current' : ''} onClick={() => { setActive(id); setMobile(false); }}>{label}</Link>)}
        <Link href="/#contact" className="mobile-contact" onClick={() => setMobile(false)}>Get in touch</Link>
      </nav>
      <div className="header-actions">
        <button className="utility command-trigger" type="button" onClick={() => { setQuery(''); dialog.current?.showModal(); search.current?.focus(); }} aria-keyshortcuts="Control+K Meta+K"><span className="sr-only">Open command palette</span><Icon name="search" size={15} /><kbd aria-hidden="true">⌘ K</kbd></button>
        <button className="utility theme-button" type="button" onClick={changeTheme} aria-label={'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' theme'}><Icon name="sun" size={17} /></button>
        <Link className="button header-contact" href="/#contact">Get in touch <Icon name="up" size={14} /></Link>
        <button className="utility menu-button" type="button" aria-expanded={mobile} aria-label="Toggle navigation" onClick={() => setMobile(!mobile)}><Icon name={mobile ? 'cross' : 'menu'} /></button>
      </div>
    </div>
    <dialog className="command-dialog" ref={dialog} aria-labelledby="command-title" onClick={event => { if (event.target === dialog.current) dialog.current.close(); }}>
      <div className="command-body">
        <div className="command-heading"><h2 id="command-title">Command palette</h2><button type="button" aria-label="Close command palette" className="utility" onClick={() => dialog.current?.close()}><Icon name="cross" /></button></div>
        <label className="field command-field"><span>Search sections, projects or skills</span><input ref={search} value={query} onChange={event => setQuery(event.target.value)} placeholder="Try Kubernetes or RAG" type="search" /></label>
        {results.length === 0 && <p role="status">No matching commands or content.</p>}
        {results.map(result => 'theme' in result && result.theme ?
          <button className="command-result" type="button" key={result.text} onClick={() => { changeTheme(); dialog.current?.close(); }}>{result.text}<span>{result.caption}</span></button> :
          'asset' in result && result.asset ?
            <a className="command-result" key={result.text} href={localAsset(result.asset)} download={resumeFilename} onClick={() => dialog.current?.close()}>{result.text}<span>{result.caption}</span></a> :
            <Link className="command-result" key={result.text} href={result.href || '/'} onClick={() => dialog.current?.close()}>{result.text}<span>{result.caption}</span></Link>)}
      </div>
    </dialog>
  </header>;
}

export function Footer() {
  return <footer className="site-footer"><div className="wrap footer-inner">
    <div><Link href="/" className="footer-brand">{profile.name}</Link><p>{profile.role} · {profile.location}</p></div>
    <div className="footer-links"><a href={profile.linkedin}>LinkedIn <Icon name="up" size={13}/></a><a href={profile.github}>GitHub <Icon name="up" size={13}/></a><Link href="/#top">Back to top</Link></div>
  </div></footer>;
}
