import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Architecture, Evaluation, ProjectGlyph } from '@/components/work';
import { Eyebrow, Icon } from '@/components/ui';
import { profile, projects, siteUrl } from '@/lib/content';

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return projects.map(project => ({ slug: project.id })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find(item => item.id === slug);
  return project ? { title: project.title, description: project.summary, alternates: { canonical: siteUrl + '/work/' + slug + '/' }, openGraph: { title: project.title, description: project.summary, url: siteUrl + '/work/' + slug + '/', images: [siteUrl + '/social.png'] } } : {};
}

export default async function CaseStudy({ params }: Props) {
  const { slug } = await params;
  const project = projects.find(item => item.id === slug);
  if (!project) notFound();
  const index = projects.indexOf(project);
  const next = projects[(index + 1) % projects.length];
  const data = { '@context': 'https://schema.org', '@type': 'CreativeWork', name: project.title, description: project.summary, url: siteUrl + '/work/' + slug + '/', author: { '@type': 'Person', name: profile.name } };

  return <div className="wrap detail-page" id="top">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
    <Link href="/#work" className="text-link back-link">← All work</Link>
    <div className={'case-hero tone-' + project.accent}>
      <div><Eyebrow>Case {project.number} / {project.kind}</Eyebrow><h1>{project.title}</h1><p>{project.summary}</p></div>
      <div className="case-art"><ProjectGlyph index={project.number} /></div>
    </div>
    <div className="case-meta">{project.stack.map(tech => <span className="tag" key={tech}>{tech}</span>)}</div>
    <div className="case-body">
      <section className="detail-section"><h2>The problem</h2><p>{project.problem}</p><h3>My responsibilities</h3><p>{project.role}</p></section>
      <section className="detail-section"><h2>System architecture</h2><p>Select a stage to inspect the data flow. The diagram uses a simplified public view.</p><Architecture stages={project.stages} play /></section>
      <section className="detail-section"><h2>Engineering decisions</h2><h3>Challenge</h3><p>{project.challenges}</p><h3>Approach</h3><p>{project.decision}</p></section>
      <section className="detail-section"><h2>Evaluation & outcomes</h2><p>{project.evaluation}</p>{project.metrics && <Evaluation metrics={project.metrics} />}<p className="outcome">{project.outcome}</p></section>
      <section className="detail-section"><h2>Lessons & next steps</h2><p>{project.lesson}</p><p>{project.next}</p></section>
    </div>
    {next !== project && <Link href={'/work/' + next.id + '/'} className="next-project"><span><small className="mono">Next case study</small><strong>{next.title}</strong></span><Icon name="up" size={24} /></Link>}
  </div>;
}
