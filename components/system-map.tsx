'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { PointerEvent } from 'react';

const nodes = [
  { label: 'AI Engineering', x: 63, y: 19, color: 'cyan', text: 'AI Engineering' },
  { label: 'NLP & ML', x: 83, y: 40, color: 'violet', text: 'Machine Learning & NLP' },
  { label: 'Backend Systems', x: 83, y: 69, color: 'cyan', text: 'Backend & Software' },
  { label: 'Data Engineering', x: 50, y: 82, color: 'amber', text: 'Data Engineering' },
  { label: 'Infrastructure', x: 22, y: 63, color: 'violet', text: 'Infrastructure & MLOps' },
  { label: 'Data & Storage', x: 23, y: 34, color: 'cyan', text: 'Databases & Storage' },
];
const stars = [
  [12, 17], [31, 8], [53, 11], [77, 14], [89, 23], [92, 57], [91, 84], [72, 87], [63, 94],
  [31, 90], [11, 79], [10, 42], [32, 21], [73, 27], [67, 68], [39, 65], [38, 41], [60, 37],
  [28, 55], [74, 54], [42, 76], [57, 64], [46, 26], [14, 49], [55, 23], [71, 76], [37, 53],
];
const chords = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,3],[5,2],[1,4]];

export function SystemMap() {
  const [selected, setSelected] = useState<number | null>(null);
  const active = selected === null ? null : nodes[selected];
  function reactToPointer(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--parallax-x', (14 * ((event.clientX - rect.x) / rect.width - .5)) + 'px');
    event.currentTarget.style.setProperty('--parallax-y', (10 * ((event.clientY - rect.y) / rect.height - .5)) + 'px');
  }

  return <div className="system-panel" onPointerMove={reactToPointer} onPointerLeave={event => {
    event.currentTarget.style.setProperty('--parallax-x', '0px');
    event.currentTarget.style.setProperty('--parallax-y', '0px');
  }}>
    <div className="map-top"><span><i /> SYSTEM MAP</span><span>MOATASEM / 2026</span></div>
    <div className="map-field">
      <svg aria-hidden="true" className="map-drawing" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs><radialGradient id="map-light"><stop stopColor="currentColor" stopOpacity=".18" /><stop offset="1" stopColor="currentColor" stopOpacity="0"/></radialGradient></defs>
        <ellipse cx="52" cy="49" rx="46" ry="46" fill="url(#map-light)" />
        <path className="map-axis" d="M4 49h92M52 4v92M20 18l65 63M83 16 21 83" />
        {[15, 25, 35, 43].map(radius => <ellipse className="map-orbit" key={radius} cx="52" cy="49" rx={radius} ry={radius * 1.04} />)}
        {chords.map(([from,to]) => <line className="map-chord" key={from + '-' + to} x1={nodes[from].x} y1={nodes[from].y} x2={nodes[to].x} y2={nodes[to].y}/>)}
        {nodes.map((node, index) => <line key={node.label} className={selected === index ? 'map-edge is-selected' : 'map-edge'} x1="52" y1="49" x2={node.x} y2={node.y}/>)}
        {stars.map(([x,y], index) => <circle className="map-star" key={x + '-' + y} cx={x} cy={y} r={index % 5 === 0 ? '.42' : '.23'}/>)}
      </svg>
      <div className="map-core" aria-hidden="true"><div><span>MM</span></div></div>
      {nodes.map((node, index) => <button type="button" key={node.label} className={'map-node tone-' + node.color} style={{ left: node.x + '%', top: node.y + '%' }} aria-pressed={selected === index} onClick={() => setSelected(selected === index ? null : index)}><i/><span>{node.label}</span></button>)}
    </div>
    <div className="map-bottom">
      <span aria-live="polite">{active ? active.text : 'Select a node to explore'}</span>
      {active ? <Link href={'/?domain=' + encodeURIComponent(active.text) + '#expertise'}>View expertise ↗</Link> : <span className="map-scale" aria-hidden="true">− · − · −</span>}
    </div>
  </div>;
}
