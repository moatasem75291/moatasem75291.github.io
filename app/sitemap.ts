import type { MetadataRoute } from 'next';
import { notes, projects, siteUrl } from '@/lib/content';

export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl + '/' },
    ...projects.map(project => ({ url: siteUrl + '/work/' + project.id + '/' })),
    ...notes.map(note => ({ url: siteUrl + '/notes/' + note.slug + '/' })),
  ];
}
