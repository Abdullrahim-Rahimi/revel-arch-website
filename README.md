# Revēl Architecture: website

Bilingual (English / Arabic) static website for Revēl Architecture, Kuwait (`rvl.design`). Built with [Astro](https://astro.build), with SEO and AEO (answer-engine optimisation) built in.

- Design: `docs/superpowers/specs/2026-11-14-revel-starter-website-design.md`
- Content guide (where each owner answer goes): `docs/content-guide.md`
- Owner questionnaire and source documents: Jira PD-7489

## Commands

| Command | What it does |
|---|---|
| `npm install` | Install dependencies (Node 20+). |
| `npm run dev` | Local dev server at http://localhost:4321 |
| `npm run build` | **Preview** build into `dist/`. Every page is `noindex`, `robots.txt` blocks crawlers, and placeholders are outlined. |
| `npm run build:prod` | **Production** build. Indexable; fails if any placeholder content remains. |
| `npm test` | Unit tests (i18n, structured data, content parity). |
| `npm run test:dist` | Tests against the built HTML (run `npm run build` first). Also builds both modes into `dist-preview/` and `dist-prod/`. |
| `npm run check` | TypeScript / Astro type check. |

## How content works

All copy lives in Markdown files, one file per language, with the **same file name** in `en/` and `ar/`. The build fails if a file exists in one language only.

```
src/content/
  pages/{en,ar}/      home, about, lead-architect, services, projects, contact
  services/{en,ar}/   villas, chalets, commercial, interiors, supervision
  projects/{en,ar}/   one file per project
src/i18n/ui.ts        navigation, buttons and labels (both languages; a missing Arabic key fails the build)
src/site.config.ts    phone, WhatsApp, email, address, hours, social links
src/assets/           images (placeholders in src/assets/placeholders/)
```

### Add a project

1. Put the photos in `src/assets/projects/<slug>/` (JPG, at least 2500 px on the long side).
2. Create `src/content/projects/en/<slug>.md` and `src/content/projects/ar/<slug>.md`. Copy an existing project file and edit it. Fields: `title`, `description` (≤ 160 characters), `type` (`villa` | `chalet` | `commercial`), `location`, optional `plotArea`, `builtArea`, `floors`, `year`, `status`, `services`, `cover`, `coverAlt`, `gallery` (`src` + `alt`), `featured`, `isRender`, and optional `quote`.
3. Set `placeholder: false` and update `updated:` to today.
4. `npm run build && npm run test:dist`.

### Replace placeholder content

Placeholder content is marked in two ways:

- Content files have `placeholder: true` in their frontmatter. Set it to `false` once the owner's text is in.
- A page whose text is confirmed but whose image is still stock sets `imagePlaceholder: true` (pages collection only). Remove it once a real photo is in.
- Contact details are listed in `siteConfig.placeholders` (`src/site.config.ts`). Remove each field name once its real value is in.
- Arabic copy counts as unreviewed until `siteConfig.arabicApproved` is set to `true`, after a native Arabic reader has approved it.

`node scripts/check-placeholders.mjs` lists everything still outstanding, page by page. `npm run build:prod` refuses to finish until the list is empty.

Bracketed tokens such as `[YEAR]` or `[NUMBER]` mark facts only the owner can supply. Never replace them with guesses.

### Images

`node scripts/make-placeholder-images.mjs` regenerates the placeholder images, and `node scripts/make-og.mjs` regenerates the default social-sharing image (`public/og-default.jpg`). Replace the logo recreation in `src/components/Logo.astro` with the owner's vector logo once it is supplied.

## SEO / AEO built in

- `hreflang` alternates, canonical URLs, Open Graph and Twitter tags on every page.
- JSON-LD: Organization + ProfessionalService, Person (lead architect), FAQPage (services), CreativeWork (projects) and BreadcrumbList. Unconfirmed contact facts are left out of the structured data rather than published.
- Answer-first sections: question headings, each followed by a self-contained answer of 40–60 words, plus a visible "last updated" date.
- `sitemap-index.xml` with language alternates. `robots.txt` explicitly allows search and AI crawlers in production.
- No `llms.txt` (deliberate; see the client's implementation plan).

## Deploy (Cloudflare Pages)

1. Push the repository to GitHub or GitLab and connect it in Cloudflare Pages.
2. Build command: `npm run build:prod`. Output directory: `dist`. Environment variable: `DEPLOY_ENV=production`.
3. For a private review link, create a second Pages project (or a preview branch) with the build command `npm run build` and no `DEPLOY_ENV`. It is `noindex` and blocks crawlers.
4. At launch, point the `rvl.design` DNS to Cloudflare Pages, and turn on **Cloudflare Web Analytics** (cookie-free, so no cookie banner is needed) in the Pages dashboard.
5. After launch, submit the sitemap in Google Search Console and Bing Webmaster Tools, and create or verify the Google Business Profile with the same name, address and phone number as `src/site.config.ts`.

## Reserved URLs (future phases)

`/<lang>/<city-slug>/` (city pages), `/<lang>/guides/<slug>/` (Arabic guides), `/<lang>/cost-index/`. Do not use these paths for anything else.
