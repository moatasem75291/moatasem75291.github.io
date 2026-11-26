import Link from 'next/link';
import type { Metadata } from 'next';
import { SystemMap } from '@/components/system-map';
import { WorkGallery } from '@/components/work';
import { Expertise, Principles, Timeline } from '@/components/expertise';
import { ContactForm, PerformanceReporter } from '@/components/contact';
import { Lab } from '@/components/lab';
import { Eyebrow, Icon, SectionHeading } from '@/components/ui';
import { books, localAsset, notes, profile, projects, resumeFilename, siteUrl, skills } from '@/lib/content';

export const metadata: Metadata = { alternates: { canonical: siteUrl + '/' } };

export default function Home() {
  return <>
    <section className="hero" id="top" aria-labelledby="home-title">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <Eyebrow>THE INTELLIGENCE ARCHITECT</Eyebrow>
          <h1 id="home-title">From intelligence<br className="desktop-break" /> to <em>infrastructure.</em></h1>
          <p className="hero-identity">Moatasem Mohammed</p>
          <p className="hero-roles">Data Scientist. AI Engineer. Systems Builder.</p>
          <p className="hero-description">Turning complex data and intelligence into systems that work in the real world.</p>
          <div className="hero-actions"><Link className="button primary" href="#work">Explore my work <Icon name="arrow" size={17}/></Link><a className="button secondary" href={localAsset(profile.resume)} download={resumeFilename}>Download résumé <Icon name="down" size={17}/></a></div>
          <div className="hero-status"><span><i /> {profile.role} @ {profile.employer}</span><span className="status-divider" aria-hidden="true" /><Link href="#about">About me <Icon name="up" size={13} /></Link></div>
        </div>
        <SystemMap />
      </div>
    </section>
    <div className="scope-strip"><div className="wrap scope-inner"><span className="scope-item"><Icon name="graph" />AI Engineering</span><span className="scope-item"><Icon name="layers" />Data Engineering</span><span className="scope-item"><Icon name="box" />Backend Systems</span><span className="scope-item"><Icon name="lab" />Applied Research</span></div></div>
    <section className="wrap section-block" id="work">
      <SectionHeading label="SELECTED WORK" title="Systems in practice." description="Engineering case studies in document intelligence, conversational AI, identity verification, and data platforms."/>
      <WorkGallery items={projects} />
    </section>
    <section className="section-block section-tinted" id="expertise"><div className="wrap">
      <SectionHeading label="KNOWLEDGE GRAPH" title="What connects the work." description="Explore a technology, see where I used it, and discover what it connects to."/>
      <Expertise skills={skills} projects={projects} />
    </div></section>
    <section className="wrap section-block" id="about">
      <SectionHeading label="ABOUT ME" title="I follow the whole system."/>
      <div className="about-grid">
        <div className="about-prose"><p className="about-lead">I build intelligent systems that bridge the gap between research, data, and real-world production.</p>{profile.about.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
        <ol className="lifecycle" aria-label="Engineering lifecycle">{['Research','Experimentation','Architecture','Engineering','Deployment','Evaluation','Optimization'].map((step, index) => <li key={step}><span className="mono">0{index + 1}</span>{step}</li>)}</ol>
      </div>
      <Principles />
      <div className="journey-block"><SectionHeading label="PROFESSIONAL JOURNEY" title="How the work evolved." /><Timeline /></div>
    </section>
    <section className="section-block section-tinted" id="lab"><div className="wrap">
      <SectionHeading label="THE LAB" title="Try the ideas." description="Follow a retrieval pipeline, step through a data flow, and search the evidence behind this portfolio." />
      <Lab />
    </div></section>
    <section className="wrap section-block" id="field-notes">
      <SectionHeading label="READING & NOTES" title="Work in progress." description="Books, questions, and practical observations from the systems I’m exploring." />
      <div className="field-grid">
        <div className="reading">
          <h3><Icon name="book" /> Reading</h3>
          {books.map(book => <article className="reading-book" key={book.id}>
            {/* The local artwork has known dimensions and needs no runtime image service. */}
            <img src={localAsset(book.cover)} width={126} height={172} alt="" loading="lazy"/>
            <div><span className="mono reading-status">{book.status}</span><h4>{book.title}</h4><p>{book.author}</p>
            {book.progress !== null && <label className="book-progress">Progress · {book.progress}% <progress value={book.progress} max={100} /></label>}
            {(book.notes.length > 0 || book.takeaways.length > 0) && <details className="plain-details"><summary>Notes & takeaways</summary>{book.notes.map(note => <p key={note}>{note}</p>)}{book.takeaways.length > 0 && <ul>{book.takeaways.map(takeaway => <li key={takeaway}>{takeaway}</li>)}</ul>}</details>}</div>
          </article>)}
          <div className="learning"><h4>Currently exploring</h4><ul>{profile.learning.map(topic => <li key={topic}>{topic}</li>)}</ul></div>
        </div>
        <div className="field-notes"><h3><Icon name="graph" /> Digital garden</h3>
          {notes.map(note => <Link className="note-link" key={note.slug} href={'/notes/' + note.slug + '/'}><div><span className="mono">{note.topic}</span><h4>{note.title}</h4><p>{note.description}</p></div><Icon name="up" size={18}/></Link>)}
        </div>
      </div>
    </section>
    <section className="section-block contact-section" id="contact"><div className="wrap contact-grid">
      <div><Eyebrow>CONTACT</Eyebrow><h2>Let’s build something<br /> that matters.</h2><p>{profile.status}</p>
        <div className="contact-links"><a href={profile.linkedin}>LinkedIn <Icon name="up" size={16}/></a><a href={profile.github}>GitHub <Icon name="up" size={16}/></a>{profile.email && <a href={'mailto:' + profile.email}><Icon name="mail" size={16}/>{profile.email}</a>}<a href={localAsset(profile.resume)} download={resumeFilename}>Résumé <Icon name="down" size={16}/></a></div>
      </div>
      <ContactForm />
    </div></section>
    <PerformanceReporter />
  </>;
}
