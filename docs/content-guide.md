# Content guide: where each questionnaire answer goes

The owner questionnaire (`Revel_Website_Content_Questionnaire.docx`, Jira PD-7489) is numbered by section. This table maps each answer to the file it replaces. Edit **both** `en/` and `ar/` versions.

| Questionnaire | File / field |
|---|---|
| 1.1 Firm name EN/AR | `src/site.config.ts` → `name`, `legalName`; Arabic also in `src/i18n/ui.ts` (`whatsapp.prefill`) |
| 1.2 Founding year | `pages/*/about.md` → `intro`; `pages/*/lead-architect.md` → `intro` (`[YEAR]`) |
| 1.3 One-line positioning | `pages/*/home.md` → `heading`, `description` |
| 1.4 Firm story | `pages/*/about.md` → `intro` |
| 1.5 Philosophy and principles | `pages/*/home.md` and `pages/*/about.md` → `principles`; about → `sections[1]` |
| 1.6 Direction | `pages/*/about.md` → `sections[3]` |
| 1.7 Project counts | `pages/*/about.md` → `sections[0]` (add only if confirmed) |
| 1.8 Areas | `pages/*/about.md` → `sections[2]` |
| 1.9 Licence and memberships | `pages/*/lead-architect.md` → `sections[2]`; services → `supervision.md` FAQ |
| 1.10 Awards and press | `pages/*/about.md` → add a section only if real items exist |
| 2.1 Name, honorific | `src/lib/seo.ts` → `personLd`; `pages/*/lead-architect.md` → `heading`, `personName` |
| 2.2 Title | `pages/*/lead-architect.md` → `jobTitle`; `src/lib/seo.ts` → `jobTitle` |
| 2.3–2.4 Education, background | `pages/*/lead-architect.md` → `intro`, `sections[0]`, `sections[2]` |
| 2.5 Approach and quote | `pages/*/lead-architect.md` → `sections[1]`, `pullQuote`; `pages/*/home.md` → `pullQuote` |
| 2.6 Expertise | `pages/*/lead-architect.md` → `knowsAbout` |
| 2.7 LinkedIn | `src/lib/seo.ts` → `personLd` `sameAs` (pass it in from `lead-architect.astro`) |
| 2.8 Portrait | replace `src/assets/placeholders/portrait.jpg` reference in `pages/*/lead-architect.md` → `image` |
| 3.1 Services list | `src/content/services/{en,ar}/*.md` (add or remove files in both languages; update `SERVICE_IDS` in `src/content.config.ts`) |
| 3.2–3.3 Deliverables, timing | `services/*/<id>.md` → `deliverables`, body, FAQ |
| 3.4 Process | `pages/*/services.md` → `process` |
| 3.5 Prices | `services/*/<id>.md` → body or a new FAQ entry |
| 3.6 Client FAQ answers | `services/*/<id>.md` → `faq` (40–60 words each) |
| 4.x Projects | `src/content/projects/{en,ar}/<slug>.md` (see README → Add a project); delete the four sample projects |
| 5.1–5.5 Contact details | `src/site.config.ts` → `whatsapp`, `phone`, `email`, `address`, `geo`, `mapsUrl`, `hours`; then remove each from `placeholders`. Hours text: `src/i18n/ui.ts` → `contact.hoursValue` |
| 5.6 Social links | `src/site.config.ts` → `instagram`, `sameAs` |
| 5.7 WhatsApp message | `src/i18n/ui.ts` → `whatsapp.prefill` |
| 5.8 Reply time | `pages/*/contact.md` → `sections[0]` |
| 6.1 Logo | `src/components/Logo.astro`, `public/favicon.svg`, then `node scripts/make-og.mjs` |
| 6.2 Brand colours | `src/styles/global.css` → `:root` tokens |
| 6.4–6.6 Photos | `src/assets/projects/<slug>/`, home `image`, about `image`, service `image` |
| 7.x Arabic approval | after approval, set `arabicApproved: true` in `src/site.config.ts` |

When everything is replaced, `npm run build:prod` succeeds. If it doesn't, its report lists what is left.
