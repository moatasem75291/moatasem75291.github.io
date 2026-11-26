import type { Metadata } from 'next';
import { Header, Footer } from '@/components/shell';
import { localAsset, profile, siteUrl } from '@/lib/content';
import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/inter';
import '@fontsource/jetbrains-mono/400.css';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl + '/'),
  title: { default: 'Moatasem Mohammed — Data Scientist & AI Engineer', template: '%s · Moatasem Mohammed' },
  description: 'From intelligence to infrastructure. Engineering case studies in Arabic document AI, retrieval evaluation, backend systems, and data platforms.',
  icons: { icon: localAsset('/mark.svg') },
  openGraph: {
    type: 'website', title: 'Moatasem Mohammed — From intelligence to infrastructure',
    description: 'Data Scientist at Tazkarti, AI Engineer and Systems Builder. Explore my work, architecture, and technical lab.',
    url: siteUrl, images: [{ url: siteUrl + '/social.png', width: 1200, height: 630, alt: 'Moatasem Mohammed — From intelligence to infrastructure' }],
  },
  twitter: { card: 'summary_large_image' },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  const person = {
    '@context': 'https://schema.org', '@type': 'Person', '@id': siteUrl + '/#person',
    name: profile.name, jobTitle: profile.role, url: siteUrl, address: { '@type': 'PostalAddress', addressCountry: 'EG' },
    worksFor: { '@type': 'Organization', name: profile.employer }, sameAs: [profile.linkedin, profile.github],
  };
  return <html lang="en" suppressHydrationWarning>
    <body>
      <script dangerouslySetInnerHTML={{ __html: "try{const t=localStorage.getItem('portfolio-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch{}" }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person).replace(/</g, '\\u003c') }} />
      <a className="skip" href="#main">Skip to content</a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </body>
  </html>;
}
