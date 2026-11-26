import type { ReactNode } from 'react';

const paths: Record<string, ReactNode> = {
  arrow: <><path d="M4 12h15m-6-6 6 6-6 6"/></>,
  up: <><path d="M6 18 18 6M7 6h11v11"/></>,
  down: <><path d="M12 3v12m-5-5 5 5 5-5M5 17v4h14v-4"/></>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></>,
  search: <><circle cx="10" cy="10" r="5.5"/><path d="m14 14 5 5"/></>,
  cross: <path d="m6 6 12 12M18 6 6 18"/>,
  layers: <><path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5m-18 4 9 5 9-5"/></>,
  graph: <><circle cx="5" cy="5" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="m7 5 10 1M6 7l5 9m7-8-5 8"/></>,
  lab: <><path d="M9 3h6m-5 0v7l-5 8a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-8V3M7 16h10"/></>,
  book: <><path d="M12 5v15m0-13c-3-3-7-4-10-3v14c3-1 7 0 10 2 3-2 7-3 10-2V4c-3-1-7 0-10 3Z"/></>,
  box: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Zm0 9 8-4.5m-8 4.5L4 7.5m8 4.5v9"/></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></>,
  menu: <path d="M4 6h16M4 12h16M4 18h16"/>,
};

export function Icon({ name, size = 18 }: { name: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.up}</svg>;
}
export function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="eyebrow"><span aria-hidden="true" />{children}</div>;
}
export function SectionHeading({ label, title, description }: { label: string; title: string; description?: string }) {
  return <div className="section-heading"><div><Eyebrow>{label}</Eyebrow><h2>{title}</h2></div>{description && <p>{description}</p>}</div>;
}
