'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Metric, Project, Stage } from '@/lib/content';
import { Icon } from './ui';

export function ProjectGlyph({ index }: { index: string }) {
  const style = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.2 };
  const variants: Record<string, React.ReactNode> = {
    '01': <><path d="M51 70 94 44l55 29 42-27M51 70l41 33 57-30 40 29M94 44l-2 59M149 73l-9 46"/><circle cx="51" cy="70" r="9"/><circle cx="94" cy="44" r="13"/><circle cx="92" cy="103" r="7"/><circle cx="149" cy="73" r="17"/><circle cx="191" cy="46" r="7"/><circle cx="189" cy="102" r="6"/><circle cx="140" cy="119" r="5"/></>,
    '02': <><path d="M41 74h32l15-17 19 42 18-63 17 53 14-15h45M45 111h153M45 38h153"/><circle cx="45" cy="74" r="5"/><circle cx="201" cy="74" r="5"/></>,
    '03': <><path d="M75 43h90v64H75zM69 56H56v-19h19m90 0h19v19m0 39v19h-19m-90 0H56V95M65 77h111"/><circle cx="120" cy="69" r="12"/><path d="M98 100c1-21 43-21 44 0"/></>,
    '04': <><path d="m47 92 73 35 73-35m-146-18 73 35 73-35m-146-18 73 35 73-35-73-35-73 35Z"/><path d="M120 92v35M47 56v36m146-36v36"/></>,
    '05': <><ellipse cx="120" cy="76" rx="67" ry="26" transform="rotate(-26 120 76)"/><ellipse cx="120" cy="76" rx="67" ry="26" transform="rotate(35 120 76)"/><ellipse cx="120" cy="76" rx="67" ry="26" transform="rotate(90 120 76)"/><circle cx="120" cy="76" r="8"/><circle cx="175" cy="46" r="4"/><circle cx="157" cy="118" r="4"/></>,
  };
  return <svg viewBox="0 0 240 150" width="240" height="150" aria-hidden="true"><g {...style}>{variants[index] ?? variants['05']}</g></svg>;
}

export function WorkGallery({ items }: { items: Project[] }) {
  const [filter, setFilter] = useState('All work');
  const categories = ['All work', ...new Set(items.map(project => project.domain))];
  const visible = items.filter(project => filter === 'All work' || project.domain === filter);
  return <>
    <div className="filters" aria-label="Filter projects">
      {categories.map(category => <button type="button" className="chip" aria-pressed={filter === category} onClick={() => setFilter(category)} key={category}>{category}</button>)}
    </div>
    <div className="project-grid">
      {visible.map(project => <article key={project.id} className={'project-card tone-' + project.accent}>
        <Link className="project-link" href={'/work/' + project.id + '/'}>
          <div className="project-art"><span>{project.number} / {project.kind}</span><ProjectGlyph index={project.number} /><div className="project-arrow"><Icon name="up" size={18} /></div></div>
          <div className="project-copy"><p className="mono project-domain">{project.domain}</p><h3>{project.title}</h3><p>{project.summary}</p><span className="text-link">Read case study <Icon name="arrow" size={15} /></span></div>
        </Link>
      </article>)}
    </div>
  </>;
}

export function Architecture({ stages, play = false }: { stages: Stage[]; play?: boolean }) {
  const [active, setActive] = useState(0);
  if (!stages.length) return <p>Architecture stages are unavailable.</p>;
  return <div className="architecture">
    <div className="stage-buttons" aria-label="Architecture stages">
      {stages.map((stage, index) => <button type="button" key={stage.name} className={['stage', active === index ? 'stage-active' : '', ['Bronze','Silver','Gold'].includes(stage.name) ? 'layer-' + stage.name.toLowerCase() : ''].join(' ')} aria-pressed={active === index} onClick={() => setActive(index)}><span className="mono">0{index + 1}</span>{stage.name}</button>)}
    </div>
    <div className="stage-detail" aria-live="polite"><div><h3>{stages[active].name}</h3><p>{stages[active].detail}</p></div>{play && <button className="button secondary" type="button" onClick={() => setActive((active + 1) % stages.length)}>Next step <Icon name="arrow" size={16} /></button>}</div>
    <details className="plain-details"><summary>Read all architecture steps</summary><ol>{stages.map(stage => <li key={stage.name}><strong>{stage.name}</strong> — {stage.detail}</li>)}</ol></details>
  </div>;
}

export function Evaluation({ metrics }: { metrics: Metric[] }) {
  const [index, setIndex] = useState(0);
  const dataset = metrics[index];
  if (!dataset) return null;
  const values = [
    { label: 'Mean Recall@K', value: dataset.recall },
    { label: 'Mean reciprocal rank', value: dataset.mrr, rank: true },
    { label: 'Full evidence hit rate', value: dataset.hit },
    { label: 'Multi-source full hits', value: dataset.multi },
  ];
  return <div className="evaluation">
    <div className="filters" aria-label="Benchmark sets">{metrics.map((set, position) => <button className="chip" aria-pressed={position === index} key={set.name} type="button" onClick={() => setIndex(position)}>{set.name} · n={set.sample}</button>)}</div>
    <div className="metrics" aria-live="polite">{values.map(metric => <div className="metric" key={metric.label}><span>{metric.label}</span><strong>{metric.rank ? metric.value.toFixed(3) : (metric.value * 100).toFixed(1) + '%'}</strong><div aria-hidden="true"><i style={{ width: metric.value * 100 + '%' }} /></div></div>)}</div>
    <p className="muted">Benchmarks use separate question sets. Recall and hit rates measure retrieved evidence. Reciprocal rank summarizes where the first relevant result appears.</p>
  </div>;
}
