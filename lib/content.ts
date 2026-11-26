import profileData from '@/content/profile.json';
import projectData from '@/content/projects.json';
import skillData from '@/content/skills.json';
import journeyData from '@/content/journey.json';
import bookData from '@/content/books.json';
import noteData from '@/content/notes.json';

export type Stage = { name: string; detail: string };
export type Metric = { name: string; sample: number; recall: number; mrr: number; hit: number; multi: number };
type Publishable = { published: boolean; visible?: boolean; order: number };
export type Project = Publishable & {
  id: string; number: string; title: string; short: string; domain: string; kind: string; accent: string;
  summary: string; problem: string; role: string; challenges: string; decision: string;
  evaluation: string; outcome: string; lesson: string; next: string;
  stack: string[]; stages: Stage[]; metrics?: Metric[];
};
export type Skill = Publishable & { name: string; domain: string; level: string; projects: string[] };
type Book = Publishable & { id: string; title: string; author: string; cover: string; status: string; progress: number | null; notes: string[]; takeaways: string[] };

function published<T extends Publishable>(items: readonly T[]): T[] {
  return items.filter(item => item.published && item.visible !== false).sort((left, right) => left.order - right.order);
}

export const profile = profileData;
export const projects = published<Project>(projectData);
export const skills = published<Skill>(skillData);
export const journey = published(journeyData);
export const books = published<Book>(bookData);
export const notes = published(noteData);
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://moatasem75291.github.io').replace(/\/$/, '');

export function localAsset(path: string) {
  return path.startsWith('/') ? basePath + path : path;
}
