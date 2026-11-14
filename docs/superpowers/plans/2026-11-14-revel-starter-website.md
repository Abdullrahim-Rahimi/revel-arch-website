# Revēl Starter Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A static, bilingual (English LTR / Arabic RTL) starter website for Revēl Architecture, with placeholder content and SEO/AEO built in from the start.

**Architecture:** Astro outputs pure static HTML. Routes are hand-rolled under `src/pages/[lang]/` and use `getStaticPaths` over `['en','ar']`. Copy lives in content collections (Markdown, one file per language) plus a typed UI-string dictionary. Placeholders are marked by a single mechanism (`data-placeholder` attributes in the HTML, plus flags in config), which a post-build script turns into a failure in production mode.

**Tech Stack:** Node 24, Astro 5, `@astrojs/sitemap`, `sharp` (Astro image pipeline), `@fontsource-variable/jost`, `@fontsource/ibm-plex-sans-arabic`, Vitest, `node-html-parser` (dist tests). Plain CSS with custom properties and logical properties.

**Spec:** `docs/superpowers/specs/2026-11-14-revel-starter-website-design.md`

## Global Constraints

- Site URL `https://rvl.design`. Paths `/en/...` and `/ar/...`, trailing slash on every page path.
- `<html lang="en" dir="ltr">` / `<html lang="ar" dir="rtl">`. `hreflang` alternates `en`, `ar`, `x-default` → `/en/` equivalent.
- Brand: display name **Revēl Architecture**, plain-text and URL name "Revel". Arabic name (unconfirmed) **ريفيل للعمارة**. Lead architect: `name` "Husain Almousawi", `honorificPrefix` "Sayed", Arabic "السيد حسين الموسوي".
- Colours: background `#1d1e25`, grey `#8a8a8f`, accent green `#0d6b55`. Body text must meet WCAG 2.2 AA (≥ 4.5:1); light font weights only at ≥ 28px.
- Fonts are self-hosted (no Google Fonts request): Jost for Latin, IBM Plex Sans Arabic for Arabic.
- No `llms.txt`, no keyword stuffing, no contact form, no cookies, no third-party embeds (maps, Instagram widgets).
- Never invent facts in placeholder copy (no awards, client names, counts or years). Every owner-supplied value renders with `data-placeholder`.
- Services (in order): `villas`, `chalets`, `commercial`, `interiors`, `supervision`.
- Reserved, not built: `/<lang>/<city-slug>/`, `/<lang>/guides/<slug>/`, `/<lang>/cost-index/`. Page slugs must not collide with these.
- Build modes via env `DEPLOY_ENV=preview|production` (default `preview`). Preview: `<meta name="robots" content="noindex,nofollow">`, robots.txt `Disallow: /`, placeholder check warns. Production: indexable, robots.txt allows all (including GPTBot, ClaudeBot, PerplexityBot, Google-Extended), placeholder check exits non-zero.
- Lighthouse mobile ≥ 95 in all four categories on every page type.
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

- **Missing Arabic string:** a UI key that exists in `en` but not in `ar` must fail the build, never fall back to English on an Arabic page. Test: Task 1 `t()` throws.
- **Content in one language only:** a project or service with an `en` file but no `ar` file (or the reverse) would give a language switch that leads to a 404. It must fail the build. Test: Task 4 `assertParity`.
- **Root `/` without JavaScript:** a crawler or no-JS visitor at `/` must see working links to `/en/` and `/ar/`, not a blank page. Test: Task 2 dist test.
- **Latin and numbers inside Arabic text:** phone numbers, emails and "Revēl" inside RTL text must not reorder (e.g. `+965 …` must not come out as `… 965+`). They are wrapped in `<bdi dir="ltr">`. Test: Task 9 dist test.
- **Preview indexed by mistake:** a preview build must carry `noindex` and `Disallow: /`, and a production build must carry neither. Test: Task 10 runs both modes.

---

## File Structure

```
astro.config.mjs              site, integrations (sitemap), build.format 'directory'
package.json                  scripts: dev, build, build:prod, test, test:dist, check:placeholders
vitest.config.ts
src/
  site.config.ts              business facts + placeholder flags + deployEnv
  i18n/
    ui.ts                     UI string dictionary {en:{}, ar:{}}
    utils.ts                  LANGS, Lang, isLang, t, localizedPath, altPath, dirOf
  lib/
    seo.ts                    JSON-LD builders (pure functions)
    content.ts                assertParity, getLocalized helpers over collections
  content.config.ts           collections: projects, services, pages
  content/
    projects/{en,ar}/<slug>.md
    services/{en,ar}/<id>.md
    pages/{en,ar}/{home,about,lead-architect,contact}.md
  assets/placeholders/*.jpg   generated placeholder images
  styles/global.css           tokens, base, RTL-safe layout, placeholder styling
  components/
    Seo.astro  Header.astro  Footer.astro  LangSwitch.astro  Logo.astro
    WhatsAppButton.astro  Ph.astro  Faq.astro  AnswerSection.astro
    ProjectCard.astro  Breadcrumbs.astro  LastUpdated.astro
  layouts/BaseLayout.astro
  pages/
    index.astro               root language chooser/redirect
    404.astro
    robots.txt.ts
    [lang]/index.astro  about.astro  lead-architect.astro  services.astro  contact.astro
    [lang]/projects/index.astro  [lang]/projects/[slug].astro
scripts/
  make-placeholder-images.mjs
  check-placeholders.mjs
tests/
  unit/i18n.test.ts  unit/seo.test.ts  unit/content.test.ts
  dist/helpers.ts    dist/*.test.ts   (parse built HTML in dist/)
```

---

### Task 1: Scaffold, i18n core and test harness

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `src/site.config.ts`, `src/i18n/ui.ts`, `src/i18n/utils.ts`, `tests/unit/i18n.test.ts`

**Interfaces:**
- Produces:
  - `type Lang = 'en' | 'ar'`, `LANGS: readonly Lang[] = ['en','ar']`, `isLang(x: string): x is Lang`
  - `t(lang: Lang, key: UiKey): string` (throws `Error("Missing ar translation: <key>")` if absent or empty)
  - `localizedPath(lang: Lang, path: string): string`, e.g. `('ar','/about/')` → `/ar/about/`, `('en','/')` → `/en/`
  - `altPath(pathname: string, to: Lang): string`, e.g. `('/en/projects/x/','ar')` → `/ar/projects/x/`
  - `dirOf(lang: Lang): 'ltr' | 'rtl'`
  - `siteConfig` object: `{ url, name: {en,ar}, legalName, phone, whatsapp, email, address: {en,ar}, geo, hours, instagram, sameAs: string[], placeholders: string[], arabicApproved: boolean, deployEnv: 'preview'|'production' }`. `placeholders` lists the field names still unconfirmed (initially phone, whatsapp, email, address, geo, hours). `deployEnv` reads `process.env.DEPLOY_ENV ?? 'preview'`.

- [ ] **Step 1:** Scaffold the project in the repo root with `npm create astro@latest . -- --template minimal --typescript strict --no-git --install`. Then add `@astrojs/sitemap sharp @fontsource-variable/jost @fontsource/ibm-plex-sans-arabic`, and dev deps `vitest node-html-parser`. Set `site: 'https://rvl.design'`, `trailingSlash: 'always'` and `build: { format: 'directory' }`. Add scripts: `test` = `vitest run tests/unit`, `test:dist` = `vitest run tests/dist`.
- [ ] **Step 2: Write failing tests** in `tests/unit/i18n.test.ts`:
  - `localizedPath('ar','/about/') === '/ar/about/'`; `localizedPath('en','/') === '/en/'`
  - `altPath('/en/projects/villa-one/','ar') === '/ar/projects/villa-one/'`; `altPath('/ar/','en') === '/en/'`
  - `dirOf('ar') === 'rtl'`, `dirOf('en') === 'ltr'`
  - every key in `ui.en` exists and is non-empty in `ui.ar`, and vice versa
  - `t('ar', 'nav.home')` returns Arabic text; calling `t` with a key deleted from a cloned dict (use an injectable `t` helper `makeT(dict)`) throws `/Missing ar translation/`
- [ ] **Step 3:** Run `npm test`. Expected: FAIL (modules missing).
- [ ] **Step 4:** Implement `src/i18n/utils.ts` (`makeT(dict)` returns `t`; the exported `t = makeT(ui)`) and `src/i18n/ui.ts`. The keys cover nav (`nav.home|about|leadArchitect|services|projects|contact`), `lang.switch`, `cta.whatsapp`, `whatsapp.prefill`, `footer.rights`, `footer.followUs`, `projects.filter.all|villa|chalet|commercial`, `projects.facts.*`, `common.lastUpdated`, `common.skipToContent`, `notFound.*`, `root.choose`. Write natural Arabic, not word-for-word. Prefill: EN "Hello Revēl, I'd like to discuss a project." / AR "مرحباً ريفيل، أود مناقشة مشروع."
- [ ] **Step 5:** Run `npm test`. Expected: PASS. Run `npx astro check`. Expected: 0 errors.
- [ ] **Step 6:** Commit `feat: scaffold Astro project with i18n core`.

### Task 2: Brand, layout shell, SEO head and language routing

**Files:**
- Create: `src/styles/global.css`, `src/components/{Logo,Header,Footer,LangSwitch,WhatsAppButton,Seo,Ph,LastUpdated,Breadcrumbs}.astro`, `src/layouts/BaseLayout.astro`, `src/pages/index.astro`, `src/pages/404.astro`, `src/pages/[lang]/index.astro` (temporary stub, replaced in Task 5), `tests/dist/helpers.ts`, `tests/dist/shell.test.ts`

**Interfaces:**
- Consumes: Task 1 i18n and `siteConfig`.
- Produces:
  - `BaseLayout` props `{ lang: Lang; title: string; description: string; path: string /* lang-less, e.g. '/about/' */; ogImage?: ImageMetadata; jsonLd?: object[]; breadcrumbs?: {name:string; path:string}[]; placeholder?: boolean }`
  - `<Ph>` wraps owner-supplied content and renders `<span data-placeholder>` (or `as="div"`) with its slot. In preview mode, CSS shows a dashed outline and a small "PLACEHOLDER" badge.
  - `tests/dist/helpers.ts`: `load(path: string): HTMLElement` parses `dist/<path>/index.html`; `ldOf(root): object[]` returns the parsed JSON-LD blocks.
  - Arabic pages get `data-placeholder="arabic-unreviewed"` on `<main>` while `siteConfig.arabicApproved === false`.

- [ ] **Step 1: Write failing dist tests** in `tests/dist/shell.test.ts` (run after `npm run build`):
  - `/en/` → `html[lang=en][dir=ltr]`; `/ar/` → `html[lang=ar][dir=rtl]`
  - each has exactly one `h1`, a `link[rel=canonical]` equal to `https://rvl.design/<lang>/`, and `link[rel=alternate][hreflang=en|ar|x-default]` (x-default → `/en/`)
  - each has `meta[name=description]`, `og:title`, `og:image`, `twitter:card`
  - the language switch on `/en/` links to `/ar/`
  - a WhatsApp link `a[href^="https://wa.me/"]` exists whose `text=` param decodes to the page-language prefill
  - root `/index.html` contains `a[href="/en/"]` and `a[href="/ar/"]` in markup (no-JS fallback), plus `link[rel=alternate]` for both
  - preview build (default): `meta[name=robots][content="noindex,nofollow"]` is present
  - `404.html` exists and contains text in both languages
- [ ] **Step 2:** `npm run build && npm run test:dist`. Expected: FAIL.
- [ ] **Step 3:** Implement `global.css`:
  - tokens `--bg #1d1e25`, `--surface` (slightly lighter), `--text` (off-white), `--muted` (≥ 4.5:1 on `--bg`), `--accent #0d6b55`, `--accent-text` (a lighter green readable on `--bg`)
  - `:lang(ar)` switches the font family to IBM Plex Sans Arabic
  - logical properties only (no `left`/`right` margins or paddings)
  - `[dir=rtl] .flip` mirrors directional icons
  - `prefers-reduced-motion` respected; visible focus rings; skip link
  - preview-only placeholder styling, scoped under `html[data-env=preview] [data-placeholder]`
- [ ] **Step 4:** Implement `Logo.astro` as an inline SVG recreating the "rvēl" wordmark: thin rounded grey strokes, with a green bar over the e. Implement `Seo.astro` (title pattern `"<page> · Revēl Architecture"`, Home uses the brand name alone; canonical, hreflang, OG and Twitter tags, preview robots meta, JSON-LD `<script type="application/ld+json">` per item). Implement `BaseLayout`, `Header` (nav plus `LangSwitch` using `altPath`), `Footer`, and `WhatsAppButton` (sticky on mobile, `href = https://wa.me/<digits>?text=<encodeURIComponent(prefill)>`).
- [ ] **Step 5:** Implement `src/pages/index.astro`. It is a minimal bilingual page with two links. An inline script redirects to `/ar/` when `navigator.language` starts with `ar`, and to `/en/` otherwise. `<link rel=alternate>` tags are included. Implement `404.astro` with both languages side by side.
- [ ] **Step 6:** `npm run build && npm run test:dist`. Expected: PASS. Open `npm run dev` and look at `/en/` and `/ar/` at 375px and 1280px. The Arabic header mirrors, the logo does not, and the language switch keeps the page.
- [ ] **Step 7:** Commit `feat: brand layout shell with bilingual SEO head`.

### Task 3: Structured data builders

**Files:**
- Create: `src/lib/seo.ts`, `tests/unit/seo.test.ts`
- Modify: `src/layouts/BaseLayout.astro` (always include the organization LD; add breadcrumbs LD when `breadcrumbs` is given)

**Interfaces:**
- Produces (each returns a plain object with `@context: 'https://schema.org'`):
  - `organizationLd(lang: Lang): object`: `@type: ['Organization','ProfessionalService']`, `@id: 'https://rvl.design/#org'`, name in lang, `alternateName` in the other language, `url`, `logo`, `address` (`PostalAddress`, `addressCountry: 'KW'`), `geo`, `telephone`, `email`, `openingHoursSpecification`, `sameAs`, `areaServed: 'Kuwait'`, `founder: { '@id': 'https://rvl.design/#lead-architect' }`
  - `personLd(lang: Lang): object`: `@type: 'Person'`, `@id: 'https://rvl.design/#lead-architect'`, `name: 'Husain Almousawi'` (EN) or Arabic, `honorificPrefix`, `jobTitle`, `worksFor: {'@id': 'https://rvl.design/#org'}`, `knowsAbout: string[]`, `image`, `url`
  - `breadcrumbLd(items: {name:string; url:string}[]): object`
  - `faqLd(items: {q:string; a:string}[]): object`
  - `projectLd(p: { name; description; url; image: string[]; location; year?; type }): object`: `@type: 'CreativeWork'`, `creator: {'@id': '…#org'}`, `contentLocation: {'@type':'Place', name: location, address: {addressCountry:'KW'}}`
  - Fields whose value is a placeholder are omitted, never emitted as fake values.

- [ ] **Step 1: Write failing tests:**
  - `organizationLd('en').name === 'Revēl Architecture'`, `organizationLd('ar').name === 'ريفيل للعمارة'`, and `organizationLd('en').founder['@id']` equals `personLd('en')['@id']`
  - `organizationLd` omits `telephone` while `'phone'` is in `siteConfig.placeholders` (test both states by passing an injectable config: `organizationLd(lang, cfg = siteConfig)`)
  - `faqLd([{q:'Q',a:'A'}]).mainEntity[0]` deep-equals `{'@type':'Question', name:'Q', acceptedAnswer:{'@type':'Answer', text:'A'}}`
  - `breadcrumbLd` positions start at 1
  - every builder's output survives `JSON.parse(JSON.stringify(x))` unchanged
- [ ] **Step 2:** `npm test`. Expected: FAIL.
- [ ] **Step 3:** Implement `src/lib/seo.ts` and wire the organization and breadcrumb LD into `BaseLayout`.
- [ ] **Step 4:** `npm test && npm run build && npm run test:dist`. Expected: PASS. Add a dist assertion that `/en/` has exactly one block whose `@id` ends in `#org`.
- [ ] **Step 5:** Commit `feat: JSON-LD builders for org, person, faq, breadcrumbs, projects`.

### Task 4: Content collections, placeholder content and images

**Files:**
- Create: `src/content.config.ts`, `src/lib/content.ts`, `tests/unit/content.test.ts`, `scripts/make-placeholder-images.mjs`, `src/assets/placeholders/*.jpg`, plus content files:
  - `src/content/services/{en,ar}/{villas,chalets,commercial,interiors,supervision}.md`
  - `src/content/projects/{en,ar}/{courtyard-villa,family-villa,sea-chalet,mixed-use-building}.md`
  - `src/content/pages/{en,ar}/{home,about,lead-architect,contact}.md`

**Interfaces:**
- Produces schemas (Zod, in `content.config.ts`, each collection loaded via `glob` with `id` = `<lang>/<slug>`):
  - all: `placeholder: boolean` (default true), `updated: date`, `title`, `description` (≤ 160 chars)
  - `services`: `order: number`, `summary`, `forWho`, `deliverables: string[]`, `faq: {q,a}[]` (2–3 entries); body = long description
  - `projects`: `type: 'villa'|'chalet'|'commercial'`, `location`, `plotArea?: number`, `builtArea?: number`, `floors?: string`, `year?: number`, `status: 'completed'|'under-construction'|'concept'`, `services: ServiceId[]`, `cover: image()`, `gallery: image()[]`, `featured: boolean`, `quote?: {text, by}`, `isRender: boolean`
  - `pages`: `sections?: {question: string; answer: string /* 40–60 words */}[]`, plus page-specific optional fields (`positioning`, `principles: string[]`, `knowsAbout: string[]`, `pullQuote`)
- `src/lib/content.ts`:
  - `assertParity(ids: string[]): void` throws `Error("Missing <lang> version: <slug>")` when a slug lacks either language
  - `getByLang<C>(collection: C, lang: Lang)` returns entries sorted (`order` for services; `featured` then `year` desc for projects); it calls `assertParity` on first use
  - `getEntryFor(collection, lang, slug)`
  - `slugOf(id)`

- [ ] **Step 1: Write failing tests** in `tests/unit/content.test.ts`: `assertParity(['en/a','ar/a'])` does not throw; `assertParity(['en/a','ar/a','en/b'])` throws `/Missing ar version: b/`; `assertParity(['ar/c'])` throws `/Missing en version: c/`; `slugOf('ar/sea-chalet') === 'sea-chalet'`.
- [ ] **Step 2:** `npm test`. Expected: FAIL.
- [ ] **Step 3:** Implement the schemas and `src/lib/content.ts`.
- [ ] **Step 4:** Write `scripts/make-placeholder-images.mjs`. It uses `sharp` to generate JPGs: soft charcoal-to-grey gradients with a thin geometric line motif and the word "PLACEHOLDER" in small caps. Sizes: 2400×1600 (3:2 covers and gallery) and 1600×2000 (4:5 portrait). Make 6 landscape images and 1 portrait. Run it and commit the output.
- [ ] **Step 5:** Write the content files. Every file is `placeholder: true`. Copy is realistic in tone and length and follows the firm-introduction positioning (customised, purpose-driven, high-end villas and chalets, commercial-purpose buildings), with no invented facts. Owner-only facts use bracketed tokens such as `[YEAR]` and `[NUMBER]` (the same tokens as the questionnaire). The four projects are 2 villas, 1 chalet and 1 commercial, with neutral descriptive titles, no client names, and `quote` omitted. Write the Arabic as natural Arabic.
- [ ] **Step 6:** `npm test && npx astro sync && npx astro check`. Expected: PASS, 0 errors.
- [ ] **Step 7:** Commit `feat: content collections with bilingual placeholder content`.

### Task 5: Home page

**Files:**
- Modify: `src/pages/[lang]/index.astro`
- Create: `src/components/ProjectCard.astro`, `tests/dist/home.test.ts`

**Interfaces:**
- Consumes: `getByLang`, `pages/<lang>/home`, `<Ph>`, `BaseLayout`, `personLd` (teaser only links to the person; no Person LD here).
- Produces: `ProjectCard` props `{ lang; slug; title; type; location; cover: ImageMetadata; isRender: boolean }`. It renders `<Picture formats={['avif','webp']}>`, shows a "Render" label when `isRender`, and links to `localizedPath(lang, '/projects/<slug>/')`.

- [ ] **Step 1: Write failing dist tests:** on `/en/` and `/ar/`:
  - the `h1` contains the positioning line
  - there are ≥ 3 project cards linking to `/<lang>/projects/<slug>/`
  - there are 5 service links to `/<lang>/services/#<id>`
  - there is a lead-architect teaser linking to `/<lang>/lead-architect/`
  - every `img` has non-empty `alt` and `width`/`height`
  - the first (hero) image is not `loading=lazy`, and all later images are lazy
- [ ] **Step 2:** `npm run build && npm run test:dist`. Expected: FAIL.
- [ ] **Step 3:** Build the page. Sections in order:
  1. Hero: positioning line plus a large image.
  2. Short intro (2–3 sentences).
  3. Featured projects grid.
  4. Services summary.
  5. Approach in 3 principles.
  6. Lead architect teaser (portrait plus pull quote).
  7. Closing WhatsApp call to action.

  Image-led layout with generous whitespace; subtle fade-in only.
- [ ] **Step 4:** `npm run build && npm run test:dist`. Expected: PASS. Check visually at 375px and 1280px in both languages.
- [ ] **Step 5:** Commit `feat: home page`.

### Task 6: About and Lead Architect pages (answer-first)

**Files:**
- Create: `src/pages/[lang]/about.astro`, `src/pages/[lang]/lead-architect.astro`, `src/components/AnswerSection.astro`, `tests/dist/about.test.ts`

**Interfaces:**
- Produces: `AnswerSection` props `{ question: string; answer: string; id?: string }`. It renders `<h2 id>` with the question, then a `<p class="answer">` with the 40–60 word answer, then its slot for longer text.

- [ ] **Step 1: Write failing dist tests:**
  - both pages exist in both languages, each with one `h1`, ≥ 3 `h2` ending in `?` (EN) or `؟` (AR), and a `time[datetime]` "last updated"
  - `/en/lead-architect/` has a Person LD with `@id` `https://rvl.design/#lead-architect` and `honorificPrefix` `Sayed`
  - breadcrumb LD is present on both pages
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Build both pages from `pages/<lang>/about` and `pages/<lang>/lead-architect`. About covers story, philosophy (principles) and direction. Lead Architect covers portrait, title, background, approach (pull quote) and areas of expertise. Each answer-first section uses `AnswerSection`. The `knowsAbout` field feeds `personLd`.
- [ ] **Step 4:** Run. Expected: PASS. Check visually in both languages.
- [ ] **Step 5:** Commit `feat: about and lead architect pages`.

### Task 7: Services page with FAQ

**Files:**
- Create: `src/pages/[lang]/services.astro`, `src/components/Faq.astro`, `tests/dist/services.test.ts`

**Interfaces:**
- Produces: `Faq` props `{ items: {q:string; a:string}[] }`. It renders `<details><summary>` (the answers are present in the HTML without JavaScript).

- [ ] **Step 1: Write failing dist tests:** `/en/services/` and `/ar/services/` have 5 sections with ids `villas, chalets, commercial, interiors, supervision`, in that order. Each section has an `h2`, a deliverables list and an FAQ. There is exactly one FAQPage LD whose `mainEntity` count equals the total number of FAQ items on the page. Every answer's text appears in the HTML outside any script. A `time[datetime]` last-updated element is present.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Build the page: intro, "How we work" (4–6 steps from `pages`, or inline from the services intro), then the 5 service sections, each with an image, its FAQ, and a WhatsApp call to action.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Commit `feat: services page with FAQ structured data`.

### Task 8: Projects index and project detail pages

**Files:**
- Create: `src/pages/[lang]/projects/index.astro`, `src/pages/[lang]/projects/[slug].astro`, `tests/dist/projects.test.ts`

- [ ] **Step 1: Write failing dist tests:**
  - the index in both languages lists 4 cards
  - the filter controls are links or buttons with `data-filter` values `all|villa|chalet|commercial`; with JS off all cards are visible
  - each `/<lang>/projects/<slug>/` exists for all 4 slugs × 2 languages, with:
    - an `h1` that includes the location
    - a facts list (type, location, status, plus plot and built area when present)
    - a gallery of `picture` elements
    - a CreativeWork LD whose `url` equals the canonical URL, a `time[datetime]` last-updated element
    - breadcrumbs Home › Projects › Title
  - the language switch on `/en/projects/sea-chalet/` points to `/ar/projects/sea-chalet/`
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Build the index: a grid of `ProjectCard`, plus a tiny inline script that toggles `hidden` by `data-type` (progressive enhancement). Build the detail page: `getStaticPaths` over `LANGS ×` slugs from `getByLang`; hero cover, facts, story (Markdown body), services used (linking to `/services/#id`), gallery with a "Render" note when `isRender`, and links to next/previous projects.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Commit `feat: projects index and detail pages`.

### Task 9: Contact page

**Files:**
- Create: `src/pages/[lang]/contact.astro`, `tests/dist/contact.test.ts`

- [ ] **Step 1: Write failing dist tests:**
  - both languages: one primary WhatsApp button, plus `a[href^="tel:"]`, `a[href^="mailto:"]`, an address and opening hours
  - a "Get directions" link to `https://www.google.com/maps/...`
  - an Instagram link `https://www.instagram.com/rvl.arch/`
  - no `iframe` anywhere
  - on `/ar/contact/`, the phone, email and WhatsApp number texts each sit inside `bdi[dir=ltr]`
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Build the page from `siteConfig` plus `pages/<lang>/contact`. Wrap every placeholder value in `<Ph>`. Add a short "What happens after you message us" answer-first section and a reply-time line.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Commit `feat: contact page`.

### Task 10: Sitemap, robots, build modes and placeholder gate

**Files:**
- Create: `src/pages/robots.txt.ts`, `scripts/check-placeholders.mjs`, `tests/dist/modes.test.ts`
- Modify: `astro.config.mjs` (sitemap with `i18n: { defaultLocale: 'en', locales: { en: 'en', ar: 'ar' } }`, filter out `/404/` and `/`), `package.json` (`build:prod` = `DEPLOY_ENV=production astro build && node scripts/check-placeholders.mjs`; use `cross-env` for Windows)

**Interfaces:**
- `scripts/check-placeholders.mjs`:
  - scans `dist/**/*.html` for `data-placeholder`, and reads `siteConfig.placeholders` and `arabicApproved`
  - prints a grouped list (`page → count`, plus config fields)
  - exits 1 when `DEPLOY_ENV=production` and anything is found, and 0 with a warning otherwise

- [ ] **Step 1: Write failing tests** in `tests/dist/modes.test.ts`. They spawn builds into separate out dirs (`astro build --outDir dist-preview` / `dist-prod` with `DEPLOY_ENV` set):
  - Preview:
    - `robots.txt` contains `Disallow: /`
    - every page has the noindex meta
    - `html[data-env=preview]`
  - Production:
    - `robots.txt` contains `Allow: /`, `Sitemap: https://rvl.design/sitemap-index.xml`, and explicit `User-agent` blocks for GPTBot, ClaudeBot, PerplexityBot and Google-Extended allowing `/`
    - no noindex meta
    - the sitemap contains `/en/about/` and `/ar/about/`, with `xhtml:link` alternates
  - `node scripts/check-placeholders.mjs` against the prod output exits 1 and lists `/ar/` pages and `phone`
  - against the preview output it exits 0
- [ ] **Step 2:** Run `npx vitest run tests/dist/modes.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement. Confirm that no `llms.txt` is emitted.
- [ ] **Step 4:** Run the full suite: `npm test && npm run build && npm run test:dist`. Expected: PASS.
- [ ] **Step 5:** Commit `feat: sitemap, robots, build modes and placeholder gate`.

### Task 11: Quality pass — Lighthouse, accessibility, RTL review, docs

**Files:**
- Create: `README.md` (how to run, how to add a project, how to replace placeholders, build modes, deploy to Cloudflare Pages: build command `npm run build:prod`, output `dist`, env `DEPLOY_ENV=production`; enable Cloudflare Web Analytics (cookie-free) in the Pages dashboard at launch), `docs/content-guide.md` (one page: where each questionnaire answer goes)

- [ ] **Step 1:** `npm run build && npx astro preview`. Run Lighthouse (mobile) on `/en/`, `/ar/`, `/en/services/`, `/ar/projects/sea-chalet/` and `/en/contact/`. Expected: ≥ 95 in Performance, Accessibility, Best Practices and SEO. Fix anything below. The SEO score will flag preview `noindex`; also run against the `dist-prod` build for SEO.
- [ ] **Step 2:** Keyboard-only pass on one EN and one AR page: the skip link works, focus is visible, the language switch and WhatsApp button can be reached, and the filters can be operated.
- [ ] **Step 3:** RTL visual review at 375px and 1280px on every AR page type. Check that nothing is mirrored that shouldn't be (logo, photos, numbers), that arrows flip, that there's no English left in the Arabic UI (apart from the brand in `bdi`), and that line height suits Arabic.
- [ ] **Step 4:** Write `README.md` and `docs/content-guide.md`.
- [ ] **Step 5:** Commit `docs: README and content guide; quality fixes`.
