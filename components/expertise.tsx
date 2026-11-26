'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { profile, journey, type Skill, type Project } from '@/lib/content';
import { Icon } from './ui';

export function Expertise({ skills, projects }: { skills: Skill[]; projects: Project[] }) {
  const domains = ['All domains', ...new Set(skills.map(skill => skill.domain))];
  const [domain, setDomain] = useState('All domains');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Skill | null>(null);
  const [level, setLevel] = useState('All experience');

  useEffect(() => {
    function readLocation() {
      const params = new URLSearchParams(window.location.search);
      const name = params.get('skill');
      const requested = params.get('domain');
      if (name) {
        const match = skills.find(skill => skill.name === name);
        if (match) { setDomain('All domains'); setLevel('All experience'); setQuery(name); setSelected(match); }
      } else if (requested && skills.some(skill => skill.domain === requested)) {
        setDomain(requested); setLevel('All experience'); setQuery(''); setSelected(null);
      }
    }
    readLocation();
    window.addEventListener('popstate', readLocation);
    window.addEventListener('hashchange', readLocation);
    return () => { window.removeEventListener('popstate', readLocation); window.removeEventListener('hashchange', readLocation); };
  }, [skills]);

  const visible = skills.filter(skill => (domain === 'All domains' || skill.domain === domain) &&
    (level === 'All experience' || skill.level === level) &&
    (skill.name + ' ' + skill.domain).toLowerCase().includes(query.trim().toLowerCase()));
  const current = selected && visible.includes(selected) ? selected : visible[0];
  const evidence = current ? projects.filter(project => current.projects.includes(project.id)) : [];
  const related = current ? skills.filter(skill => skill !== current && skill.projects.some(id => current.projects.includes(id))).slice(0, 6) : [];

  return <div className="expertise-shell">
    <div className="expertise-controls">
      <label className="field"><span>Find a skill</span><input type="search" placeholder="Try RAG, Kubernetes or OCR" value={query} onChange={event => setQuery(event.target.value)} /></label>
      <label className="field"><span>Experience</span><select value={level} onChange={event => setLevel(event.target.value)}>{['All experience', 'Production', 'Experimental', 'Learning'].map(item => <option key={item}>{item}</option>)}</select></label>
    </div>
    <div className="expertise-body">
      <div className="domain-list" aria-label="Expertise domains">
        {domains.map(item => <button key={item} type="button" aria-pressed={domain === item} onClick={() => { setDomain(item); setSelected(null); }}><Icon name="graph" size={16}/>{item}</button>)}
      </div>
      <div className="skill-node-list" aria-label="Matching skills">
        {visible.length ? visible.map(skill => <button type="button" className="skill-node" aria-pressed={current === skill} key={skill.name} onClick={() => setSelected(skill)}><i className={'level-' + skill.level.toLowerCase()} />{skill.name}</button>) : <p role="status">No skills match. Try another term or filter.</p>}
      </div>
      <div className="skill-detail" aria-live="polite">
        {current ? <><p className="mono">{current.domain}</p><h3>{current.name}</h3><span className="tag">{current.level}</span>
          <h4>Project evidence</h4>
          {evidence.length ? evidence.map(project => <Link className="evidence-link" key={project.id} href={'/work/' + project.id + '/'}>{project.title}<Icon name="up" size={15}/></Link>) : <p>No published case study is linked yet.</p>}
          {related.length > 0 && <><h4>Connected through projects</h4><div className="related">{related.map(skill => <button type="button" key={skill.name} className="chip" onClick={() => { setDomain('All domains'); setLevel('All experience'); setQuery(''); setSelected(skill); }}>{skill.name}</button>)}</div></>}
        </> : <p>Select a domain or search to see project evidence.</p>}
      </div>
    </div>
    <details className="plain-details"><summary>Browse expertise as a text list</summary><ul className="skills-text">{skills.map(skill => <li key={skill.name}><strong>{skill.name}</strong> · {skill.domain} · {skill.level}{projects.filter(p => skill.projects.includes(p.id)).map(p => <Link key={p.id} href={'/work/' + p.id + '/'}>{p.title}</Link>)}</li>)}</ul></details>
  </div>;
}

export function Principles() {
  const [active, setActive] = useState(0);
  const principle = profile.principles[active];
  return <div className="principle-panel"><h3>How I think</h3><div className="principle-grid"><div className="principle-buttons">{profile.principles.map((item, index) => <button type="button" key={item.title} aria-pressed={index === active} onClick={() => setActive(index)}><span className="mono">0{index + 1}</span>{item.title}</button>)}</div><div className="principle-detail" aria-live="polite"><span className="mono">0{active + 1}</span><h4>{principle.title}</h4><p>{principle.body}</p></div></div></div>;
}

export function Timeline() {
  const [active, setActive] = useState(journey[0]?.id);
  return <div className="timeline">
    {journey.map(job => <details key={job.id} open={active === job.id} onToggle={event => { if (event.currentTarget.open) setActive(job.id); else if (active === job.id) setActive(''); }}>
      <summary><span className="mono">{job.period}</span><span><strong>{job.title}</strong><span>{job.org}</span></span><span className="timeline-toggle" aria-hidden="true">+</span></summary>
      <p>{job.detail}</p>
    </details>)}
  </div>;
}
