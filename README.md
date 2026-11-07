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

## Admin on the live site (Vercel)

The site is hosted on Vercel at https://silkcoverconsulting.vercel.app. Pages are static; only `/keystatic` runs as a function. Editing on the live site saves straight to GitHub (`maiwand-ai/silkcoverconsulting`), and Vercel republishes in about 1–2 minutes.

One-time setup:

1. **Create the GitHub App (on your computer).** With `.env` containing `PUBLIC_KEYSTATIC_GITHUB_REPO=maiwand-ai/silkcoverconsulting`, run `npm run dev`, open http://localhost:4321/keystatic and click **Create GitHub App**. Approve it on GitHub and install it on the `silkcoverconsulting` repository. Keystatic writes four values into `.env`: `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`, `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`.
2. **Allow the live address to log in.** On GitHub: Settings → Developer settings → GitHub Apps → your app → add the callback URL `https://silkcoverconsulting.vercel.app/api/keystatic/github/oauth/callback` (keep the localhost one) and save.
3. **Add environment variables on Vercel** (Project → Settings → Environment Variables, Production): the four values from `.env`, plus `KEYSTATIC_ADMIN=1` and `PUBLIC_KEYSTATIC_GITHUB_REPO=maiwand-ai/silkcoverconsulting`. Then redeploy.
4. Open https://silkcoverconsulting.vercel.app/keystatic and sign in with GitHub. Only accounts with write access to the repository can edit.

`.env` holds secrets and is never committed. To keep editing local files on your computer afterwards, remove the `PUBLIC_KEYSTATIC_GITHUB_REPO` line from `.env`.

When the domain is connected, add `SITE_URL=https://your-domain` on Vercel, add a matching callback URL to the GitHub App, and update `public/robots.txt`.

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
| Domain | Vercel env `SITE_URL`, GitHub App callback, `public/robots.txt` | using silkcoverconsulting.vercel.app until connected |
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
