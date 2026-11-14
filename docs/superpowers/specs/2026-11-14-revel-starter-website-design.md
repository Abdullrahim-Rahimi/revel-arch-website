# Revēl Architecture — Bilingual Starter Website: Design

Date: 2026-11-14 · Requested by: Rise Advisory (on behalf of the client) · Tracking: Jira PD-7489

## 1. Intent

Revēl Architecture (Kuwait, domain `rvl.design`, Instagram `@rvl.arch`) is currently invisible to Google and to AI assistants such as ChatGPT. The current site is a WordPress placeholder showing only a logo.

We are building a **starter website that introduces the firm**: what it does, the direction it is taking, and its lead architect. The site must be built from day one so that search engines (SEO) and AI answer engines (AEO) can understand, index and cite it. It is the foundation that later content (city pages, Arabic guides, a cost index — see the client's implementation plan) will be added to.

### How the firm is presented (decided by the requester)

- Revēl is an **architecture firm**, not an "engineering office". Do not use engineering-office framing.
- Revēl designs **high-end, functional villas and chalets**, plus buildings with a commercial purpose. Each design is **highly customised to the owner and their family**: how they will live in it, its features and amenities, or the commercial use it must serve.
- Tone: calm, premium, considered, studio-like. Purpose-driven design, not budget messaging.
- **Do not lead with** the marketing strategy's budget, stalled-permit, permit-rejection or contractor audiences. Owners of plots in new housing cities (South Sabah Al-Ahmad, South Saad Al-Abdullah, Al-Mutlaa) are a valid audience, but they are reached through quality and customisation messaging, not cost-rescue messaging.

## 2. Goals, non-goals, anti-goals

**Goals**
- Six page types, each in English and Arabic: Home, About, Lead Architect, Services, Projects (index + one page per project), Contact.
- Fully bilingual: Arabic is a first-class right-to-left (RTL) site, not a translation layer.
- Technically excellent for SEO and AEO (section 6).
- Easy for a developer to add projects and edit text by editing files. **There is no admin panel or CMS.**
- Fast: static HTML, optimised images, minimal JavaScript.
- Placeholder content everywhere real content is missing, clearly marked so it can be found and replaced.

**Non-goals (for now)**
- Team page (deliberately left out; may come later).
- Blog, guides, city landing pages, cost index (future phases; the structure must allow them without rework).
- CMS or admin UI, user accounts, e-commerce, booking.
- Paid advertising pixels or tracking scripts beyond basic privacy-friendly analytics (see section 8).

**Anti-goals (would be a failure even if it works)**
- Arabic that feels bolted on: mirrored incorrectly, wrong fonts, or English left in Arabic pages.
- Looking like a generic template or a cheap "engineering office" site.
- Fabricated facts presented as real: fake awards, fake client quotes or fake statistics that could go live. Placeholders must be obviously placeholders.
- Content hidden behind JavaScript, so crawlers see an empty page.
- `llms.txt` or keyword stuffing (the client's plan explicitly rules these out).

## 3. Constraints

- Domain `rvl.design` is owned by the client and currently points at WordPress hosting. Switching DNS needs the client's access; this happens at launch, not during the build.
- Brand source is the existing logo only (no brand guide exists):
  - Background near-black charcoal, approximately `#1d1e25`
  - Wordmark "rvēl" in thin, rounded, geometric grey strokes, approximately `#8a8a8f`
  - One accent: the deep-green bar over the "e" (the macron), approximately `#0d6b55`
  - "Revēl Architecture" set in an extra-light, wide sans-serif
  - The brand name is spelled **Revēl** (with a macron) in display contexts and "Revel" in plain-text and URL contexts.
- Logo file: `https://rvl.design/wp-content/uploads/2023/04/The_Logo_Only.png` (8839×8505 PNG on a dark background). An SVG version should be requested from the client; until then, recreate the wordmark as an inline SVG approximation or use the PNG.
- Ongoing edits are made by a developer (in practice, Claude) directly in the files.

## 4. Decisions on how it is built (requester-approved)

- **Static site generator: Astro.** Content lives as Markdown/MDX files in content collections, one file per project per language. Output is pure static HTML.
- **Hosting: Cloudflare Pages** (free tier), with `rvl.design` pointed at it at launch. The build output must also be deployable to any static host.
- **Version control: git.**
- **URLs:** language-prefixed: `/en/...` and `/ar/...`. The root `/` sends visitors to the right language (see section 5.3).
- **Language switch** on every page, linking to the same page in the other language.

## 5. Site structure

### 5.1 Pages

| Page | EN path | AR path | Purpose |
|---|---|---|---|
| Home | `/en/` | `/ar/` | Positioning line, short intro, featured projects, services summary, lead architect teaser, contact call to action |
| About | `/en/about/` | `/ar/about/` | The firm's story, philosophy (purpose-built, customised design) and direction |
| Lead Architect | `/en/lead-architect/` | `/ar/lead-architect/` | Sayed Husain Almousawi: biography, credentials, design approach, portrait |
| Services | `/en/services/` | `/ar/services/` | One section per service with an anchor, plus an FAQ |
| Projects index | `/en/projects/` | `/ar/projects/` | Grid of projects, filterable by type (villa / chalet / commercial) |
| Project detail | `/en/projects/<slug>/` | `/ar/projects/<slug>/` | One page per project |
| Contact | `/en/contact/` | `/ar/contact/` | WhatsApp (primary), phone, email, office address, map, Instagram |
| 404 | — | — | Bilingual not-found page |

Arabic URL slugs: use the same Latin slugs as English for the starter (simple and robust). Arabic-script slugs for future city and guide pages are a later decision.

### 5.2 Services (starter set — builder's/Claude's proposal, to be confirmed by the owner)

1. Architectural design — villas
2. Architectural design — chalets and coastal homes
3. Commercial and investment buildings
4. Interior design
5. Construction supervision

Each service has a short description, "who it's for", what the client receives, and 2–3 FAQ entries.

### 5.3 Language behaviour

- `<html lang="en" dir="ltr">` and `<html lang="ar" dir="rtl">`.
- Root `/`: a static page. A small script sends the visitor to `/ar/` or `/en/` based on the browser language, and the page also shows plain links to both for crawlers and visitors without JavaScript. The default for unknown languages is English.
- `hreflang` alternates on every page (`en`, `ar`, `x-default` → `/en/`).
- Layout uses CSS logical properties (`margin-inline-start`, etc.) so RTL mirrors correctly. Directional icons (arrows) flip; the logo, photos and numerals do not.
- Numerals: Western digits (0-9) in both languages for the starter.

## 6. SEO and AEO requirements

Per page:
- Unique `<title>` and meta description in that page's language.
- Canonical URL; `hreflang` alternates.
- Open Graph and Twitter card tags with a per-page image.
- One `<h1>`; a logical heading order.
- A visible "last updated" date on content pages (About, Lead Architect, Services, project pages).

Structured data (JSON-LD), justified for Google rich results and entity resolution — not as an AI-citation tactic:
- Site-wide `Organization` + `ProfessionalService` (name, logo, address, geo, phone, opening hours, `sameAs` → Instagram and later Google Business Profile).
- `Person` on the Lead Architect page (`jobTitle`, `worksFor`, `knowsAbout`, `sameAs`).
- `BreadcrumbList` on interior pages.
- `FAQPage` where an FAQ block exists.
- On project pages, `CreativeWork`/`Place`-style data (name, location area, year, type, images).

Answer-first writing pattern (AEO), applied to Services, About and Lead Architect:
- Headings phrased as the questions people actually ask ("What does a villa design project with Revēl include?").
- A self-contained 40–60 word answer directly under each such heading.
- Specific facts, not slogans; cite sources where a fact comes from outside the firm.
- Named author/expert attribution (the lead architect).

Technical:
- `sitemap.xml` (both languages, with alternates) and `robots.txt` allowing all crawlers, including AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended).
- Images: responsive `srcset`, modern formats (AVIF/WebP with JPEG fallback), width/height set, lazy-loaded below the fold, descriptive alt text in each language.
- Performance target: Lighthouse ≥ 95 for Performance, SEO, Accessibility and Best Practices on mobile.
- Accessibility: WCAG 2.2 AA contrast (watch the thin grey-on-charcoal type), keyboard navigation, focus states, skip link.
- No `llms.txt`.

## 7. Visual design

- Dark-first palette from the logo: charcoal background, off-white/grey text, the deep green used sparingly (links, the WhatsApp button, small accents). A lighter alternative surface may be used for reading-heavy sections, as long as it stays on-brand.
- Typography: a light, geometric, wide sans-serif for Latin, close to the logo's feel (e.g. Lato Light, Jost or Manrope at light weights, from Google Fonts). Pair it with a light geometric Arabic face (e.g. IBM Plex Sans Arabic, Readex Pro or Tajawal). Body text must stay readable: light weights only for large display text.
- Image-led: large project photography, generous whitespace, restrained motion (subtle fades only; respect `prefers-reduced-motion`).
- Sticky WhatsApp button on mobile as the single primary call to action; pre-filled message in the page's language.
- Final font and exact colour choices are left to the builder, within these rules.

## 8. Contact and analytics

- WhatsApp click-to-chat link (`https://wa.me/<number>?text=<prefilled>`) as the primary call to action. The number is a placeholder until supplied.
- No contact form in the starter (it would need a backend or third-party service). WhatsApp, phone and email links only.
- Map: a static map image or a link to Google Maps, not a heavy embedded map, to protect performance.
- Analytics: Cloudflare Web Analytics (cookie-free), added at deploy time. No cookie banner needed.

## 9. Placeholder content

- All text the owner must supply is wrapped in a consistent, greppable marker, e.g. a `placeholder: true` frontmatter flag plus visible `[PLACEHOLDER]`-styled text in development builds.
- Placeholder copy should be realistic in tone and length (so the layout is truthful) but must not invent specific facts: no fake award names, client names, years of experience or project statistics.
- Images: neutral architectural placeholder images (generated solid/gradient blocks or clearly licensed stock), sized to the real aspect ratios.
- Create at least 4 placeholder projects (2 villas, 1 chalet, 1 commercial) to exercise the grid and detail templates.
- A production build check fails, or prints a clear list, if any placeholder remains, so nothing ships by accident.

## 10. Deliverable: owner questionnaire (Word document)

When the build is complete, produce **`Revel_Website_Content_Questionnaire.docx`** and attach it to Jira PD-7489. It is given to the owner to collect real content. For each item it states:
- the question
- where it appears on the site
- the suggested length (word count) or format
- a suggested/example answer drafted from what is already known (strategy document, logo, conversation), which the owner can approve or rewrite.

It covers at least: firm story and founding year, mission/philosophy, positioning line (EN and AR), the lead architect's biography, qualifications, licences and memberships, the services list and descriptions, FAQ answers, project details per project (name/area, plot size, type, year, brief, client quote with permission), contact details (WhatsApp, phone, email, address, hours), social links, and a **photo and asset request list** (logo in SVG, portrait, project photographs of built work, not renders, with minimum resolution guidance). The Arabic versions: does the owner supply Arabic copy, or approve translations?

## 11. Answers to the builder check

**Source documents.** Both are attachments on Jira PD-7489 (riseadvisory.atlassian.net): `Revel_Marketing_Strategy_Aug2026.docx` and `Revel_Marketing_Implementation_Plan.xlsx`. Copy both into `docs/reference/` (git-ignored if they must stay private). The `Content & SEO` tab of the plan lists future pages, slugs and target Arabic/English queries, and its "What not to do" list applies to this build. Its keywords should inform starter titles and headings only where they fit the firm-introduction positioning in section 1.

**Future URL scheme (Claude's call).** Future city pages: `/<lang>/<city-slug>/`. Guides: `/<lang>/guides/<slug>/`. Cost index: `/<lang>/cost-index/`. These are reserved now and not built.

**Arabic during the build (Claude's call).** Claude drafts all Arabic UI and copy. Every Arabic copy string counts as placeholder until a native reader approves it, and goes through the same placeholder check as section 9. Proposed Arabic spellings: brand "ريفيل للعمارة" (Revēl Architecture), lead architect "السيد حسين الموسوي". Both are marked unconfirmed and asked about in the questionnaire, along with whether "Sayed" is an honorific. In JSON-LD, use `name` "Husain Almousawi", with "Sayed" as `honorificPrefix`, until confirmed.

**Definition of done for this build (Claude's call).** A local git repository that builds cleanly. Optionally, a Cloudflare Pages preview on a `*.pages.dev` address. Two build modes:
- **Preview:** `noindex` meta, a `robots.txt` that disallows everything, and placeholder check warns only.
- **Production:** the section 6 `robots.txt`, indexable, and the placeholder check fails the build.

The client's Cloudflare and git-host accounts, and the DNS switch, are launch tasks outside this build.

## 12. Left to the builder

- Exact component structure, CSS approach (plain CSS or a utility framework), and font choice within section 7.
- Placeholder image generation method.
- Folder layout inside the Astro project.
- Whether to use Astro's built-in i18n routing or a hand-rolled equivalent, as long as section 5.3 behaviour holds.
