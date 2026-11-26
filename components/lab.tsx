'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { rankDocuments } from '@/lib/search';
import { projects, skills } from '@/lib/content';
import { Architecture } from './work';
import { Icon } from './ui';

const corpus = [
  { title: 'Scanned documents', text: 'OCR extracts text from scanned PDF pages. Page metadata preserves the link between each passage and its source.', answer: 'Route scanned pages to OCR and attach the source page to each resulting passage.' },
  { title: 'Evidence retrieval', text: 'Semantic retrieval compares question and passage embeddings. Reranking reorders candidate evidence by relevance.', answer: 'Retrieve candidate passages with embeddings and rerank them before building the answer context.' },
  { title: 'Grounded answers', text: 'A grounded answer uses retrieved passages and cites sources. Insufficient evidence should trigger a request for more context.', answer: 'Use relevant passages as evidence and cite the corresponding sources.' },
  { title: 'Change data capture', text: 'CDC captures changes after a database snapshot. Source offsets and keys help safely replay events.', answer: 'Use a snapshot boundary and source offsets to connect initial data to later changes.' },
  { title: 'Evaluation', text: 'Recall measures how much expected evidence is retrieved. Mean reciprocal rank focuses on the first relevant item.', answer: 'Measure evidence coverage with recall and first relevant rank with MRR.' },
];
const tabs = [
  { id: 'rag', label: 'RAG simulator', mark: 'graph' },
  { id: 'pipeline', label: 'Data pipeline', mark: 'layers' },
  { id: 'architecture', label: 'Architecture explorer', mark: 'box' },
  { id: 'search', label: 'Concept search', mark: 'search' },
  { id: 'assistant', label: 'Ask my portfolio', mark: 'lab' },
] as const;
type Tab = typeof tabs[number]['id'];

export function Lab() {
  const [tab, setTab] = useState<Tab>('rag');
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [phase, setPhase] = useState(0);
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const result = rankDocuments(submitted, corpus, item => item.title + ' ' + item.text).slice(0, 3);
  const directSkills = rankDocuments(submitted, skills, skill => skill.name).slice(0, 5).map(match => match.item);
  const portfolio = rankDocuments(submitted, projects, project => [project.title, project.summary, ...project.stack].join(' '))
    .map(match => ({ ...match, score: match.score + directSkills.filter(skill => skill.projects.includes(match.item.id)).length * 3 }))
    .sort((left, right) => right.score - left.score).slice(0, 3);
  const lakehouse = projects.find(project => project.id === 'lakehouse');
  const architecture = projects.find(project => project.id === projectId);
  const prompts = tab === 'assistant' ? ['What is his experience with RAG?', 'Has he worked with Kubernetes?', 'Arabic NLP'] : ['How do I read a scanned PDF?', 'How do snapshots connect to CDC?', 'How are citations grounded?'];

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(query.trim());
    setPhase(1);
  }

  return <div className="lab-panel">
    <div className="lab-tabs" aria-label="Lab demonstrations">
      {tabs.map(item => <button type="button" aria-pressed={tab === item.id} key={item.id} onClick={() => { setTab(item.id); setQuery(''); setSubmitted(''); setPhase(0); }}><Icon name={item.mark} size={17} />{item.label}</button>)}
      <Link href="/#expertise"><Icon name="graph" size={17} />Knowledge graph</Link>
    </div>
    <div className="lab-body">
      {tab === 'architecture' ? <>
        <h3>Explore a system architecture</h3><p>Compare how different systems move from input to outcome.</p>
        <label className="field"><span>Case study</span><select value={projectId} onChange={event => setProjectId(event.target.value)}>{projects.map(project => <option key={project.id} value={project.id}>{project.title}</option>)}</select></label>
        {architecture && <Architecture key={architecture.id} stages={architecture.stages} play />}
      </> : tab === 'pipeline' ? <>
        <h3>Walk through the medallion layers</h3><p>This educational walkthrough illustrates a batch and CDC flow.</p>
        {lakehouse ? <Architecture stages={lakehouse.stages} play /> : <p>The pipeline is unavailable.</p>}
      </> : <>
        <h3>{tab === 'assistant' ? 'Ask My Portfolio' : tab === 'search' ? 'Find a related concept' : 'Trace a question through retrieval'}</h3>
        <p>{tab === 'assistant' ? 'Searches published portfolio evidence and links you to the relevant work.' : tab === 'search' ? 'An educational demo with a small local corpus and concept aliases.' : 'An educational simulation. It retrieves passages from a small sample corpus and assembles a sourced answer.'}</p>
        <form className="lab-query" onSubmit={submit}><label className="field"><span>{tab === 'search' ? 'Concept' : 'Your question'}</span><input required maxLength={200} value={query} onChange={event => setQuery(event.target.value)} placeholder={prompts[0]} /></label><button className="button primary" type="submit">{tab === 'rag' ? 'Retrieve' : 'Search'} <Icon name="arrow" size={16} /></button></form>
        <div className="filters lab-examples">{prompts.map(prompt => <button type="button" className="chip" key={prompt} onClick={() => { setQuery(prompt); setSubmitted(prompt); setPhase(1); }}>{prompt}</button>)}</div>
        {submitted && <div className="lab-output" aria-live="polite">{tab === 'assistant' ?
          (portfolio.length ? <><h4>Published project evidence</h4>{portfolio.map(({ item }) => <div className="lab-hit" key={item.id}><Link className="text-link" href={'/work/' + item.id + '/'}>{item.title} <Icon name="up" size={15}/></Link><p>{item.role}</p></div>)}</> : <p>I couldn’t find published information that answers this question.</p>) :
          (result.length ? <><h4>{phase === 2 ? 'Grounded response' : 'Retrieved passages'}</h4>{phase === 2 ? <p>{result[0].item.answer} <strong>Source:</strong> {result[0].item.title}.</p> : result.map(({ item }) => <div className="lab-hit" key={item.title}><strong>{item.title}</strong><p>{item.text}</p></div>)}{tab === 'rag' && phase === 1 && <button className="button secondary" type="button" onClick={() => setPhase(2)}>Assemble answer <Icon name="arrow" size={16}/></button>}</> : <p>No supporting passages found in the demo corpus.</p>)}</div>}
      </>}
    </div>
  </div>;
}
