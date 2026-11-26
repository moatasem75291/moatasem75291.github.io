import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Eyebrow } from '@/components/ui';
import { notes, profile, siteUrl } from '@/lib/content';

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return notes.map(note => ({ slug: note.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const note = notes.find(item => item.slug === slug);
  return note ? { title: note.title, description: note.description, alternates: { canonical: siteUrl + '/notes/' + slug + '/' } } : {};
}
export default async function Note({ params }: Props) {
  const { slug } = await params;
  const note = notes.find(item => item.slug === slug);
  if (!note) notFound();
  const data = { '@context': 'https://schema.org', '@type': 'CreativeWork', name: note.title, description: note.description, url: siteUrl + '/notes/' + slug + '/', author: { '@type': 'Person', name: profile.name } };
  return <article className="wrap detail-page note-page" id="top">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
    <Link className="text-link back-link" href="/#field-notes">← All field notes</Link>
    <Eyebrow>{note.topic}</Eyebrow><h1>{note.title}</h1><p className="note-lead">{note.description}</p>
    <div className="detail-section note-body">{note.body.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
  </article>;
}
