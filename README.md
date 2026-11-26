# The Intelligence Architect

Moatasem Mohammed’s portfolio. Browse the primary design and visitor journeys in [DESIGN.md](DESIGN.md).

## Run the website

Use Node.js 24. Run `npm ci` and `npm run dev`. For a production-like copy, run `npm run build` and then `npm run preview` to serve the static export at http://127.0.0.1:4173.

`docker compose up --build` serves the same production export. Start the optional authoring service with `docker compose --profile authoring up --build` after setting its password in a local environment file.

## Edit and publish content

Next.js renders the public website from `content/`. GitHub authenticates repository editors, so the normal publishing workflow is to edit the appropriate JSON file as an authorized owner or collaborator, review the diff, and merge the change into `main`.

| File | Editable content |
| --- | --- |
| `content/profile.json` | Professional identity, status, bio, learning topics, résumé path and version, social links, approved email, service endpoints |
| `content/projects.json` | Case studies, project order, stack, architecture stages, verified metrics |
| `content/skills.json` | Domain and experience type, project relationships |
| `content/journey.json` | Role, employer, dates and verified responsibilities |
| `content/books.json` | Title, author, cover, reading status and nullable progress, notes and takeaways |
| `content/notes.json` | Short notes and articles with their own pages |

Set `published` and optional `visible` to control display, and `order` to move a record. Unreleased or private source content belongs in a private authoring store. Files committed to the public source repository are public regardless of these UI flags. Keep stable IDs when changing content. Update skill references if a case study is withdrawn. Use relative local asset paths under `public/`, and generate the share image and public résumé with `scripts/make-public-assets.py` (Python, Pillow, ReportLab, and DejaVu Sans) or replace them with approved assets.

The protected authoring dashboard runs separately from GitHub Pages. Copy `.env.example` to `.env`, set a strong unique `PORTFOLIO_ADMIN_PASSWORD`, run `npm run admin`, and visit http://127.0.0.1:8787. The username is `owner`. The service seeds SQLite through `service/migrations/001-initial.sql`. Save a draft, prepare a release, and download the released JSON for review and commit into `content/`. Changes to drafts are revision-checked. Back up the SQLite database and keep it private. Use loopback for local authoring. For remote use, require HTTPS and restrict authoring routes behind private access or stronger authentication.

## GitHub Pages

For a user site, the GitHub repository is named `<username>.github.io`. In the repository, select **Settings → Pages → Build and deployment → GitHub Actions**. The workflow validates content and publishes `out/` when a commit lands on `main`. Repository sites under a path are supported via the Pages action’s site URL and base path. For a custom domain or local build, set `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_BASE_PATH` as shown in `.env.example`. Every variable with the `NEXT_PUBLIC_` prefix and everything in published JSON should be treated as public.

## Contact and performance

The public form prepares a copyable LinkedIn message by default. Adding an approved email enables a draft in the visitor’s email app. To accept website submissions, deploy the optional service over HTTPS, set `PORTFOLIO_PUBLIC_ORIGIN` to the exact public origin, then add its `/contact` URL to the public profile. The service validates input, limits request rates and saves submissions to the protected inbox. The optional `/performance` endpoint records aggregate LCP values by route and day. Analytics are disabled by default. When enabled they use no cookies or identifiers and respect Do Not Track.

Ask My Portfolio searches only published case studies and skill relationships. It runs in the browser and gives project links. The educational lab uses sample documents.

## Verify changes

- `npm test` covers content relationships, routes, evaluation metrics, reading progress and concept-aware search.
- `npm run build` verifies types and the complete static export.
- Install Playwright Chromium with `npx playwright install chromium` and run `npm run test:e2e` after building. The desktop and mobile suites exercise navigation, filtering, architecture steps, benchmark switching, command search, theme persistence, the lab, contact drafts and automated accessibility checks. Set `CHROMIUM_PATH` to use a compatible local Chromium.
- Run Lighthouse against a local production preview or the published site to check performance, accessibility, best practices and SEO.
