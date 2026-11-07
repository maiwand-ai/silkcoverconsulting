/**
 * Content loader: reads the admin-managed JSON files (via the Keystatic reader)
 * and returns everything a page needs for one language, plus URL helpers.
 */
import { createReader } from '@keystatic/core/reader';
import keystaticConfig, { locales, type Locale } from '../../keystatic.config';

export { locales, type Locale };
const reader = createReader(process.cwd(), keystaticConfig);

export const localeInfo: Record<Locale, { lang: string; dir: 'ltr' | 'rtl'; name: string; prefix: string }> = {
  en: { lang: 'en', dir: 'ltr', name: 'English', prefix: '' },
  fa: { lang: 'fa-AF', dir: 'rtl', name: 'دری', prefix: '/fa' },
  ps: { lang: 'ps-AF', dir: 'rtl', name: 'پښتو', prefix: '/ps' },
};

const numberWords: Record<Locale, string[]> = {
  en: ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'],
  fa: ['صفر', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه', 'ده', 'یازده', 'دوازده'],
  ps: ['صفر', 'یو', 'دوه', 'درې', 'څلور', 'پنځه', 'شپږ', 'اووه', 'اته', 'نهه', 'لس', 'یوولس', 'دولس'],
};

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** Escapes text and turns *words* into <em>words</em> for highlighted headline words. */
export const emph = (s: string) => escapeHtml(s ?? '').replace(/\*(.+?)\*/g, '<em>$1</em>');

async function load(l: Locale) {
  const [settings, global, pagesRaw, servicesRaw, sectorsRaw, insightsRaw] = await Promise.all([
    reader.singletons[`settings_${l}`].readOrThrow(),
    reader.singletons.global.readOrThrow(),
    reader.collections[`pages_${l}`].all(),
    reader.collections[`services_${l}`].all(),
    reader.collections[`sectors_${l}`].all(),
    reader.collections[`insights_${l}`].all(),
  ]);
  const byOrder = <T extends { entry: { order?: number | null } }>(a: T, b: T) => (a.entry.order ?? 99) - (b.entry.order ?? 99);
  const pages = pagesRaw.map((p) => ({ slug: p.slug, ...p.entry })).sort((a, b) => (a.menu.order ?? 99) - (b.menu.order ?? 99));
  const services = [...servicesRaw].sort(byOrder).map((s) => ({ slug: s.slug, ...s.entry, fold: Number(s.entry.fold) }));
  const sectors = [...sectorsRaw].sort(byOrder).map((s) => ({ slug: s.slug, ...s.entry, fold: Number(s.entry.fold), services: s.entry.services.filter(Boolean) as string[] }));
  const insights = [...insightsRaw].sort(byOrder).map((s) => ({ slug: s.slug, ...s.entry, fold: Number(s.entry.fold) }));

  const info = localeInfo[l];
  const pagePath = (slug: string) => `${info.prefix}${slug === 'home' ? '/' : `/${slug}/`}`;
  const bySlug = Object.fromEntries(pages.map((p) => [p.slug, p]));
  const byTemplate = (t: string) => pages.find((p) => p.template.discriminant === t);
  const templatePath = (t: string, hash = '') => { const p = byTemplate(t); return p ? pagePath(p.slug) + (hash ? `#${hash}` : '') : pagePath('home'); };
  const insightsPage = byTemplate('insights');
  const articlePath = (slug: string) => `${insightsPage ? pagePath(insightsPage.slug) : '/'}${slug}/`;
  const serviceBySlug = Object.fromEntries(services.map((s) => [s.slug, s]));
  const count = numberWords[l][services.length] ?? String(services.length);
  const withCount = (s: string, lower = false) => (s ?? '').replace('{count}', lower ? count.toLowerCase() : count);
  const nav = pages.filter((p) => p.menu.show);
  const footerPages = pages.filter((p) => p.menu.footer);

  return {
    locale: l, info, settings, global, pages, services, sectors, insights,
    bySlug, byTemplate, serviceBySlug, nav, footerPages,
    pagePath, templatePath, articlePath, withCount,
    readMinutes: (a: (typeof insights)[number]) => Math.max(1, Math.round(a.body.reduce((n, b) => n + b.text.split(/\s+/).length, 0) / 220)),
  };
}

// Cache only during a production build. In development (where the admin runs) content is
// re-read on every request so saved edits appear immediately.
const cache = new Map<Locale, ReturnType<typeof load>>();
export const getSite = (l: Locale) => {
  if (!import.meta.env.PROD) return load(l);
  if (!cache.has(l)) cache.set(l, load(l));
  return cache.get(l)!;
};
export type Site = Awaited<ReturnType<typeof load>>;
export type Page = Site['pages'][number];
export type Service = Site['services'][number];
export type Sector = Site['sectors'][number];
export type Insight = Site['insights'][number];

/** Links to the same page in every language that has it (for the switcher and hreflang). */
export async function alternatesFor(slug: string, article?: string) {
  const out: { locale: Locale; href: string; name: string }[] = [];
  for (const l of locales) {
    const s = await getSite(l);
    if (article) { if (s.insights.some((a) => a.slug === article)) out.push({ locale: l, href: s.articlePath(article), name: localeInfo[l].name }); }
    else if (s.bySlug[slug]) out.push({ locale: l, href: s.pagePath(slug), name: localeInfo[l].name });
    else out.push({ locale: l, href: s.pagePath('home'), name: localeInfo[l].name });
  }
  return out;
}

/** Section bar items for a page, built from its content. */
export function sectionsFor(page: Page, site: Site): { id: string; label: string }[] {
  const t = page.template;
  switch (t.discriminant) {
    case 'home': { const v = t.value; return [
      { id: 'who', label: v.who.rail }, { id: 'expertise', label: v.expertise.rail }, { id: 'approach', label: v.approach.rail },
      { id: 'sectors', label: v.sectors.rail }, { id: 'insights', label: v.insights.rail }, { id: 'get-in-touch', label: v.closingRail }]; }
    case 'about': { const v = t.value; return [
      { id: 'overview', label: v.intro.rail }, { id: 'principles', label: v.principles.rail }, { id: 'values', label: v.values.rail },
      { id: 'leadership', label: v.team.rail }, { id: 'identity', label: v.identity.rail }, { id: 'get-in-touch', label: v.closingRail }]; }
    case 'expertise': return [...site.services.map((s) => ({ id: s.slug, label: s.label })), { id: 'combinations', label: t.value.combinations.rail }];
    case 'approach': { const v = t.value; return [
      ...v.stages.map((s, i) => ({ id: `stage-${i + 1}`, label: `${i + 1}. ${s.title}` })),
      { id: 'principles', label: v.principles.rail }, { id: 'get-in-touch', label: v.closingRail }]; }
    case 'industries': return [{ id: 'overview', label: t.value.overviewRail }, ...site.sectors.map((s) => ({ id: s.slug, label: s.short })), { id: 'get-in-touch', label: t.value.closingRail }];
    case 'insights': { const L = t.value.labels; return [{ id: 'featured', label: L.featured }, { id: 'articles', label: L.more }, { id: 'topics', label: L.topicsRail }, { id: 'get-in-touch', label: t.value.closingRail }]; }
    case 'contact': { const v = t.value; return [
      { id: 'enquiry-form', label: v.form.rail }, { id: 'write-to-us', label: v.write.rail }, { id: 'next-steps', label: v.steps.rail }, { id: 'where-we-are', label: v.where.rail }]; }
    case 'custom': return t.value.blocks.map((b, i) => ({ id: `section-${i + 1}`, label: 'rail' in b.value ? (b.value.rail as string) : '' })).filter((x) => x.label);
  }
  return [];
}
/** Menu list for a page: its sections minus generic closing/summary ones. */
export const menuSectionsFor = (page: Page, site: Site) => sectionsFor(page, site).filter((s) => s.id !== 'get-in-touch' && s.id !== 'combinations');
