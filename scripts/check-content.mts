/**
 * Validates every content file against the admin schema (keystatic.config.ts)
 * and checks cross-references. Run: npm run check:content
 */
import { createReader } from '@keystatic/core/reader';
import config, { locales } from '../keystatic.config';

const reader = createReader(process.cwd(), config);
const problems: string[] = [];
const required = ['home', 'expertise', 'insights', 'contact'];

for (const l of locales) {
  const [pages, services, sectors, insights, settings] = await Promise.all([
    reader.collections[`pages_${l}`].all(),
    reader.collections[`services_${l}`].all(),
    reader.collections[`sectors_${l}`].all(),
    reader.collections[`insights_${l}`].all(),
    reader.singletons[`settings_${l}`].read(),
  ]);
  if (!settings) problems.push(`${l}: site text (settings) missing`);
  const svc = new Set(services.map((s) => s.slug));
  for (const r of required) if (!pages.some((p) => p.slug === r)) problems.push(`${l}: required page "${r}" missing`);
  for (const s of sectors) for (const ref of s.entry.services) if (ref && !svc.has(ref)) problems.push(`${l}: sector ${s.slug} links to unknown service ${ref}`);
  for (const a of insights) if (a.entry.service && !svc.has(a.entry.service)) problems.push(`${l}: article ${a.slug} links to unknown service ${a.entry.service}`);
  const exp = pages.find((p) => p.entry.template.discriminant === 'expertise');
  if (exp && exp.entry.template.discriminant === 'expertise')
    for (const c of exp.entry.template.value.combinations.items) for (const ref of [c.a, c.b]) if (ref && !svc.has(ref)) problems.push(`${l}: combination links to unknown service ${ref}`);
  if (l !== 'en') {
    const en = new Set((await reader.collections.pages_en.list()));
    for (const p of pages) if (!en.has(p.slug)) problems.push(`${l}: page "${p.slug}" has no English version (language switcher cannot link it)`);
  }
  console.log(`${l}: ${pages.length} pages (${pages.map((p) => p.slug).join(', ')}), ${services.length} services, ${sectors.length} sectors, ${insights.length} articles`);
}
if (!(await reader.singletons.global.read())) problems.push('global contact settings missing');
if (problems.length) { console.error('\nProblems:\n- ' + problems.join('\n- ')); process.exit(1); }
console.log('\nAll content valid.');
