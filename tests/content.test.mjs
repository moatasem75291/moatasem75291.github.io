import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { rankDocuments } from '../lib/search.ts';

const load = name => JSON.parse(readFileSync(new URL('../content/' + name + '.json', import.meta.url), 'utf8'));
const works = load('projects');
const skills = load('skills');
const notes = load('notes');
const profile = load('profile');
const books = load('books');

test('case studies have stable routes, architecture steps and bounded benchmark values', () => {
  assert.equal(new Set(works.map(project => project.id)).size, works.length);
  for (const project of works) {
    assert.match(project.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    for (const key of ['title', 'summary', 'problem', 'role', 'challenges', 'decision', 'evaluation', 'outcome', 'lesson', 'next']) assert.ok(project[key], key);
    assert.ok(project.stages.length >= 3);
    for (const stage of project.stages) assert.ok(stage.name && stage.detail);
    for (const metric of project.metrics ?? []) {
      assert.ok(Number.isInteger(metric.sample) && metric.sample > 0);
      for (const key of ['recall', 'mrr', 'hit', 'multi']) assert.ok(metric[key] >= 0 && metric[key] <= 1);
    }
  }
});
test('published skills resolve to published project evidence', () => {
  const projects = new Set(works.filter(project => project.published && project.visible !== false).map(project => project.id));
  for (const skill of skills.filter(item => item.published && item.visible !== false)) {
    assert.ok(['Production', 'Experimental', 'Learning'].includes(skill.level));
    for (const id of skill.projects) assert.ok(projects.has(id), skill.name + ' → ' + id);
  }
});
test('reading progress can be unset and notes have unique route keys', () => {
  for (const book of books) if (book.progress !== null) assert.ok(book.progress >= 0 && book.progress <= 100);
  assert.equal(new Set(notes.map(note => note.slug)).size, notes.length);
  assert.equal(profile.principles.length, 5);
  assert.ok(profile.resume.startsWith('/'));
});
test('portfolio search uses published evidence and returns no matches for unrelated questions', () => {
  const text = project => [project.title, project.summary, ...project.stack].join(' ');
  assert.equal(rankDocuments('Has he worked with Kubernetes?', works, text)[0]?.item.id, 'eehc-chatbot');
  assert.equal(rankDocuments('Where did he use RAG?', works, text)[0]?.item.id, 'mof-rag');
  assert.equal(rankDocuments('What is his experience?', works, text).length, 0);
  assert.equal(rankDocuments('Which violin does he play?', works, text).length, 0);
});
