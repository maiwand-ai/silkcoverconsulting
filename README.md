# SilkCover Consulting website

Multilingual (English, Dari, Pashto) Astro 5 site with a built-in content admin (Keystatic).
Creative direction A "Girih".

```
npm install
npm run dev            # site: http://localhost:4321   admin: http://localhost:4321/keystatic
npm run build          # static site in dist/ (admin not included)
npm run check:content  # validate every content file and cross-reference
```

## Editing content (the admin)

Open **http://localhost:4321/keystatic** while `npm run dev` is running. The sidebar is grouped by language:

| Section | What it controls |
|---|---|
| **Whole site → Contact and form settings** | Enquiry email, “placeholder” tag, form handler URL (shared by all languages) |
| **Pages** | Every page: title, search description, menu label/description/order/artwork, whether it shows in the menu and footer, and all of its text |
| **Services** | The services shown on the map, Expertise page, menus, footer and enquiry form |
| **Sectors** | Industries page and homepage sectors, including which services each sector needs |
| **Insights articles** | Articles (order 1 = featured) |
| **Site text** | Header, menu, footer, tags, form labels and error messages, 404 page |

Saving writes a JSON file under `content/<language>/…`. In development the change appears on the next page load.

If the admin ever shows a blank page, stop the server (Ctrl+C) and run `npm run dev` again; it clears the development cache on every start.

**Pages** have a *Page type*. The seven designed pages (Home, About, Expertise, Approach, Industries, Insights, Contact) keep their layouts; **Custom page** builds a page from blocks (text, cards, numbered list, quote, call to action). To add a page, create an entry in *Pages*, choose a type and give it the **same page address in every language**. To remove a page, delete its entry (or untick *Show in menu* to hide it from navigation only). Home, Expertise, Insights and Contact are required.

Small conventions:
- `*word*` in a headline highlights that word.
- `{count}` is replaced by the number of services, written in the page’s language.
- `{email}` in form messages is replaced by the enquiry address.

## Languages

| Language | Address | Direction |
|---|---|---|
| English | `/` | left to right |
| Dari | `/fa/` | right to left |
| Pashto | `/ps/` | right to left |

The language switcher links each page to the same page in the other languages. The Dari and Pashto text is a **machine-assisted translation and must be reviewed by a native speaker before launch.** Brand names (SilkCover, NEXNGO, Sevil) stay in Latin script. Arabic-script text uses Noto Naskh Arabic (headings) and Noto Sans Arabic (body), which cover all Pashto letters.

## Admin on the live site

`npm run build` makes a static site without the admin. To edit on the live site:

1. Put this project in a GitHub repository.
2. Choose a host and install its adapter, e.g. `npx astro add vercel` or `npx astro add netlify`.
3. Set environment variables on the host: `KEYSTATIC_ADMIN=1` and `PUBLIC_KEYSTATIC_GITHUB_REPO=owner/repo`.
4. Open `/keystatic` on the live site and follow Keystatic’s prompt to create its GitHub app (it stores the app secrets as environment variables).
5. Editors sign in with GitHub. Each save is a commit; the host rebuilds the site in about 1–2 minutes.

## Project structure

- `keystatic.config.ts`: the admin’s content model (what is editable)
- `content/`: all content, one folder per language, plus `global.json`
- `src/lib/content.ts`: reads content, URL helpers, section-bar items
- `src/pages/[...path].astro`: one route for every page in every language; `404.astro`
- `src/templates/`: one template per page type (Home, About, …, Custom, Article)
- `src/components/`: Header, MenuOverlay, Footer, EnquiryForm/Dialog, ExpertiseMap, SectionRail, LangSwitch, GirihTile, …
- `src/styles/global.css`: design tokens and right-to-left rules
- `src/lib/geometry.ts`: arch and girih star maths used by every graphic

### Geometry rule
`starPath()` refuses to draw stars made of overlapping triangles (such as a six-pointed star). Use 7, 8, 9, 10, 12, 14, 16 or 18-fold stars.

## Before launch: replace placeholders

| Item | Where (admin) | Status |
|---|---|---|
| Domain | `astro.config.mjs` → `site`, `public/robots.txt` | placeholder |
| Enquiry email | Whole site → Contact and form settings | placeholder |
| Form handler | Whole site → Contact and form settings | not connected; form validates but sends nothing |
| Dari and Pashto text | each language’s entries | needs native-speaker review |
| Privacy policy | Pages → privacy (each language) | draft for legal review; provider name and retention period to fill |
| Leadership names, bios, photos | Pages → about → Leadership | sample roles |
| Values, approach stages, principles, contact steps | About / Approach / Contact pages | draft, tagged |
| Sectors | Sectors | sample, tagged |
| Insights articles | Insights articles | sample, tagged |
| Tagline | Site text → Tagline; Home → Hero | creative direction, not confirmed |
| Office locations | Contact → Where we are; Site text → Footer | not shown until confirmed |
