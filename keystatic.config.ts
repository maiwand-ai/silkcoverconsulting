/**
 * SilkCover admin (Keystatic). Open /keystatic while running `npm run dev`.
 *
 * Content lives in content/<locale>/… as JSON files, one set per language:
 *   en = English (site root), fa = Dari (/fa/), ps = Pashto (/ps/)
 * Every language has the same collections and singletons, grouped in the admin sidebar.
 */
import { config, collection, singleton, fields } from '@keystatic/core';

export const locales = ['en', 'fa', 'ps'] as const;
export type Locale = (typeof locales)[number];
const localeNames: Record<Locale, string> = { en: 'English', fa: 'Dari (دری)', ps: 'Pashto (پښتو)' };

// ---------- shared field helpers ----------
const t = (label: string, description?: string) => fields.text({ label, description });
const tt = (label: string, description?: string) => fields.text({ label, description, multiline: true });
const list = (label: string, itemLabel = 'Item') =>
  fields.array(fields.text({ label: itemLabel }), { label, itemLabel: (p) => p.value || itemLabel });
const fold = fields.select({
  label: 'Pattern symmetry',
  description: 'Number of points in this item’s girih star.',
  options: ['7', '8', '9', '10', '12', '14', '16', '18'].map((v) => ({ label: `${v}-fold`, value: v })),
  defaultValue: '8',
});
const tone = fields.select({
  label: 'Artwork colour',
  options: [{ label: 'Night lapis', value: 'dark' }, { label: 'Ivory', value: 'light' }, { label: 'Turquoise', value: 'turquoise' }],
  defaultValue: 'dark',
});
const sampleFlag = (label = 'Mark as sample') =>
  fields.checkbox({ label, description: 'Shows a visible “Sample” tag until the content is confirmed.', defaultValue: false });
const draftFlag = () => fields.checkbox({ label: 'Mark as draft', description: 'Shows a visible “Draft” tag.', defaultValue: false });
const heading = (extra: Record<string, any> = {}) =>
  fields.object({ eyebrow: t('Small label above heading'), title: t('Heading', 'Wrap words in *asterisks* to highlight them.'), ...extra });
const closing = () => fields.object({ title: t('Closing heading'), text: tt('Closing text') }, { label: 'Closing invitation' });
const textItems = (label: string) =>
  fields.array(fields.object({ title: t('Title'), text: tt('Text') }), { label, itemLabel: (p) => p.fields.title.value || 'Item' });
const rail = (label: string) => t(label, 'Label in the “On this page” bar.');

// ---------- page templates ----------
const templates = (l: Locale) => ({
  home: fields.object({
    hero: fields.object({
      eyebrow: t('Small label'),
      lines: list('Headline lines', 'Line'),
      lede: tt('Positioning statement'),
      primary: t('Main button'),
      secondary: t('Second button'),
      hint: t('Hint over the pattern'),
      scroll: t('Scroll label'),
    }, { label: 'Hero' }),
    who: fields.object({
      section: heading({ lede: tt('Introduction'), caption: t('Caption under figure'), more: t('Link text') }),
      principles: textItems('Principles (three)'),
      draft: draftFlag(),
      rail: rail('Section bar label'),
    }, { label: 'Who we are' }),
    expertise: fields.object({ section: heading({ text: tt('Text'), filterLabel: t('Filter label'), allSectors: t('“All sectors” chip') }), rail: rail('Section bar label') }, { label: 'Expertise map' }),
    approach: fields.object({ section: heading({ text: tt('Text'), link: t('Link text') }), draft: draftFlag(), rail: rail('Section bar label') }, { label: 'Approach preview' }),
    sectors: fields.object({ section: heading({ text: tt('Text'), link: t('Link text'), mapLink: t('“Show on the map” text') }), rail: rail('Section bar label') }, { label: 'Sectors' }),
    insights: fields.object({ section: heading({ text: tt('Text'), link: t('Link text') }), rail: rail('Section bar label') }, { label: 'Insights preview' }),
    closing: closing(),
    closingRail: rail('Closing section bar label'),
  }, { label: 'Home page content' }),

  about: fields.object({
    hero: fields.object({ eyebrow: t('Small label'), title: t('Headline', 'Wrap words in *asterisks* to highlight them.'), lede: tt('Introduction'), caption: t('Artwork caption') }, { label: 'Opening' }),
    intro: fields.object({ title: t('Heading'), paragraphs: fields.array(tt('Paragraph'), { label: 'Paragraphs', itemLabel: (p) => (p.value || '').slice(0, 40) }), rail: rail('Section bar label') }, { label: 'Who we are' }),
    principles: fields.object({ section: heading(), items: textItems('Principles (three)'), draft: draftFlag(), rail: rail('Section bar label') }, { label: 'Principles' }),
    values: fields.object({ section: heading(), items: textItems('Values'), draft: draftFlag(), rail: rail('Section bar label') }, { label: 'Values' }),
    team: fields.object({
      section: heading(),
      people: fields.array(fields.object({ name: t('Name'), role: t('Role'), focus: tt('Focus'), fold, sample: sampleFlag() }), { label: 'People', itemLabel: (p) => p.fields.role.value || 'Person' }),
      rail: rail('Section bar label'),
    }, { label: 'Leadership' }),
    identity: fields.object({ section: heading(), paragraphs: fields.array(tt('Paragraph'), { label: 'Paragraphs', itemLabel: (p) => (p.value || '').slice(0, 40) }), rail: rail('Section bar label') }, { label: 'Our identity' }),
    closing: closing(),
    closingRail: rail('Closing section bar label'),
  }, { label: 'About page content' }),

  expertise: fields.object({
    hero: fields.object({ eyebrow: t('Small label'), title: t('Headline (the number of services is added in front)'), accent: t('Highlighted second line'), lede: tt('Introduction') }, { label: 'Opening' }),
    labels: fields.object({ examples: t('“Practical examples”'), enquire: t('Enquiry button'), related: t('“Often combined with”'), platform: t('“Dedicated platform”'), alsoOffered: t('“Also offered through”'), ourPlatform: t('“our dedicated platform”'), fullDetails: t('“Full details”'), enquireShort: t('Short enquiry button') }, { label: 'Labels' }),
    combinations: fields.object({
      section: heading({ text: tt('Text') }),
      items: fields.array(fields.object({
        a: fields.relationship({ label: 'Service A', collection: `services_${l}` }),
        b: fields.relationship({ label: 'Service B', collection: `services_${l}` }),
        note: tt('Why they combine'),
      }), { label: 'Service combinations (also drawn as lines on the map)', itemLabel: (p) => `${p.fields.a.value ?? '?'} + ${p.fields.b.value ?? '?'}` }),
      rail: rail('Section bar label'),
    }, { label: 'Combinations' }),
    closing: closing(),
  }, { label: 'Expertise page content' }),

  approach: fields.object({
    hero: fields.object({ eyebrow: t('Small label'), title: t('Headline'), lede: tt('Introduction') }, { label: 'Opening' }),
    stages: fields.array(fields.object({ title: t('Stage name'), text: tt('Summary'), happens: list('What happens'), receive: tt('What you receive'), you: tt('Your part') }), { label: 'Stages', itemLabel: (p) => p.fields.title.value || 'Stage' }),
    labels: fields.object({ stage: t('“Stage”'), happens: t('“What happens”'), receive: t('“What you receive”'), you: t('“Your part”') }, { label: 'Labels' }),
    draft: draftFlag(),
    principles: fields.object({ section: heading(), items: textItems('Principles'), draft: draftFlag(), rail: rail('Section bar label') }, { label: 'Delivery principles' }),
    closing: closing(),
    closingRail: rail('Closing section bar label'),
  }, { label: 'Approach page content' }),

  industries: fields.object({
    hero: fields.object({ eyebrow: t('Small label'), title: t('Headline'), lede: tt('Introduction') }, { label: 'Opening' }),
    labels: fields.object({ sector: t('Grid corner label'), sectorWord: t('“Sector”'), questions: t('“Questions we help answer”'), services: t('“Services that help”'), discuss: t('Enquiry button'), yes: t('“Yes” (screen readers)'), no: t('“No” (screen readers)') }, { label: 'Labels' }),
    overviewRail: rail('Opening section bar label'),
    closing: closing(),
    closingRail: rail('Closing section bar label'),
  }, { label: 'Industries page content' }),

  insights: fields.object({
    hero: fields.object({ eyebrow: t('Small label'), title: t('Headline'), lede: tt('Introduction') }, { label: 'Opening' }),
    labels: fields.object({ all: t('“All” filter'), read: t('“Read the article”'), minRead: t('“min read”'), topics: t('“Topics we write about”'), empty: t('No articles message'), related: t('“Related service”'), discuss: t('Article enquiry button'), next: t('“Next article”'), introduction: t('“Introduction” (article section bar)'), featured: rail('“Featured” section bar label'), more: rail('“More articles” section bar label'), topicsRail: rail('“Topics” section bar label') }, { label: 'Labels' }),
    closing: closing(),
    closingRail: rail('Closing section bar label'),
  }, { label: 'Insights page content' }),

  contact: fields.object({
    hero: fields.object({ eyebrow: t('Small label'), title: t('Headline'), lede: tt('Introduction') }, { label: 'Opening' }),
    write: fields.object({ title: t('Heading'), copy: t('Copy button'), copied: t('“Copied” message'), copyFail: t('Copy failed message'), rail: rail('Section bar label') }, { label: 'Write to us' }),
    steps: fields.object({ title: t('Heading'), items: textItems('Steps'), draft: draftFlag(), rail: rail('Section bar label') }, { label: 'What happens next' }),
    where: fields.object({ title: t('Heading'), text: tt('Text'), rail: rail('Section bar label') }, { label: 'Where we are' }),
    form: fields.object({ title: t('Heading'), sub: t('Note under heading'), rail: rail('Section bar label') }, { label: 'Form' }),
  }, { label: 'Contact page content' }),

  custom: fields.object({
    hero: fields.object({ eyebrow: t('Small label'), title: t('Headline', 'Wrap words in *asterisks* to highlight them.'), lede: tt('Introduction') }, { label: 'Opening' }),
    blocks: fields.blocks({
      text: { label: 'Text section', schema: fields.object({ rail: rail('Section bar label (optional)'), eyebrow: t('Small label'), heading: t('Heading'), paragraphs: fields.array(tt('Paragraph'), { label: 'Paragraphs', itemLabel: (p) => (p.value || '').slice(0, 40) }) }) },
      cards: { label: 'Cards', schema: fields.object({ rail: rail('Section bar label (optional)'), eyebrow: t('Small label'), heading: t('Heading'), items: textItems('Cards') }) },
      list: { label: 'Numbered list', schema: fields.object({ rail: rail('Section bar label (optional)'), heading: t('Heading'), items: list('Items') }) },
      quote: { label: 'Quote', schema: fields.object({ text: tt('Quote'), source: t('Source (optional)') }) },
      cta: { label: 'Call to action', schema: fields.object({ rail: rail('Section bar label (optional)'), heading: t('Heading'), text: tt('Text'), button: t('Button text') }) },
    }, { label: 'Sections' }),
    showClosing: fields.checkbox({ label: 'Show closing invitation', defaultValue: true }),
    closing: closing(),
  }, { label: 'Page content' }),
});

const pageTypes = [
  { label: 'Home', value: 'home' },
  { label: 'About', value: 'about' },
  { label: 'Expertise', value: 'expertise' },
  { label: 'Approach', value: 'approach' },
  { label: 'Industries', value: 'industries' },
  { label: 'Insights', value: 'insights' },
  { label: 'Contact', value: 'contact' },
  { label: 'Custom page (built from sections)', value: 'custom' },
];

// ---------- per-language collections and singletons ----------
const collectionsFor = (l: Locale) => ({
  [`pages_${l}`]: collection({
    label: 'Pages',
    slugField: 'id',
    path: `content/${l}/pages/*`,
    format: { data: 'json' },
    columns: ['title'],
    schema: {
      id: fields.slug({ name: { label: 'Internal name', description: 'Use the same page address in every language so the language switcher can link them.' }, slug: { label: 'Page address', description: 'Shown in the URL. “home” is the homepage.' } }),
      title: t('Page title'),
      description: tt('Search engine description'),
      menu: fields.object({
        show: fields.checkbox({ label: 'Show in menu', defaultValue: true }),
        order: fields.integer({ label: 'Menu order', defaultValue: 10 }),
        label: t('Menu label'),
        blurb: t('Menu description'),
        fold,
        tone,
        footer: fields.checkbox({ label: 'Show in footer “Pages” list', defaultValue: true }),
      }, { label: 'Menu' }),
      template: fields.conditional(fields.select({ label: 'Page type', options: pageTypes, defaultValue: 'custom' }), templates(l)),
    },
  }),
  [`services_${l}`]: collection({
    label: 'Services',
    slugField: 'id',
    path: `content/${l}/services/*`,
    format: { data: 'json' },
    columns: ['title', 'order'],
    schema: {
      id: fields.slug({ name: { label: 'Internal name' }, slug: { label: 'Address (used for links)' } }),
      title: t('Service title'),
      label: t('Short label', 'Used on the map, tabs and menus.'),
      line: t('One-line summary'),
      intro: tt('Short introduction'),
      examples: list('Practical examples', 'Example'),
      fold,
      platformName: t('Dedicated platform name (optional)'),
      platformUrl: fields.url({ label: 'Dedicated platform link (optional)' }),
      order: fields.integer({ label: 'Order', defaultValue: 10 }),
    },
  }),
  [`sectors_${l}`]: collection({
    label: 'Sectors',
    slugField: 'id',
    path: `content/${l}/sectors/*`,
    format: { data: 'json' },
    columns: ['name', 'order'],
    schema: {
      id: fields.slug({ name: { label: 'Internal name' }, slug: { label: 'Address' } }),
      name: t('Sector name'),
      short: t('Short name (section bar)'),
      challenge: tt('Main challenge'),
      questions: list('Questions we help answer', 'Question'),
      services: fields.multiRelationship({ label: 'Services that help', collection: `services_${l}` }),
      fold,
      sample: sampleFlag(),
      order: fields.integer({ label: 'Order', defaultValue: 10 }),
    },
  }),
  [`insights_${l}`]: collection({
    label: 'Insights articles',
    slugField: 'id',
    path: `content/${l}/insights/*`,
    format: { data: 'json' },
    columns: ['title', 'order'],
    schema: {
      id: fields.slug({ name: { label: 'Internal name' }, slug: { label: 'Address' } }),
      title: t('Title'),
      kind: t('Topic'),
      dek: tt('Summary'),
      service: fields.relationship({ label: 'Related service', collection: `services_${l}` }),
      fold,
      sample: sampleFlag('Mark as sample article'),
      order: fields.integer({ label: 'Order (1 = featured)', defaultValue: 10 }),
      body: fields.array(
        fields.object({
          type: fields.select({ label: 'Type', options: [{ label: 'Paragraph', value: 'p' }, { label: 'Heading', value: 'h2' }, { label: 'Quote', value: 'quote' }], defaultValue: 'p' }),
          text: tt('Text'),
        }),
        { label: 'Article', itemLabel: (p) => `${p.fields.type.value === 'h2' ? 'Heading: ' : p.fields.type.value === 'quote' ? 'Quote: ' : ''}${(p.fields.text.value || '').slice(0, 50)}` },
      ),
    },
  }),
});

const settingsFor = (l: Locale) => ({
  [`settings_${l}`]: singleton({
    label: 'Site text (header, menu, footer, form)',
    path: `content/${l}/settings`,
    format: { data: 'json' },
    schema: {
      siteName: t('Site name'),
      shortName: t('Short name'),
      tagline: list('Tagline lines', 'Line'),
      description: tt('Default search engine description'),
      header: fields.object({ enquire: t('“Enquire” button'), menu: t('“Menu” button'), skip: t('“Skip to content”'), home: t('Logo link label') }, { label: 'Header' }),
      menu: fields.object({ kicker: t('Menu heading'), close: t('“Close”'), youAreHere: t('“You are here”'), onHome: t('“You are on Home”'), backHome: t('“Back to Home”'), sectionsOf: t('“Show sections of”'), enquiries: t('“Enquiries”'), enquire: t('Menu enquiry button'), language: t('“Language”') }, { label: 'Menu' }),
      footer: fields.object({ pages: t('“Pages” heading'), expertise: t('“Expertise” heading'), contact: t('“Contact” heading'), offices: t('Offices note'), legal: fields.array(fields.object({ label: t('Link text'), page: t('Page address (e.g. privacy)') }), { label: 'Footer legal links', itemLabel: (p) => p.fields.label.value || 'Link' }) }, { label: 'Footer' }),
      tags: fields.object({ sample: t('“Sample”'), draft: t('“Draft”'), placeholder: t('“Placeholder”'), sampleSectors: t('“Sample sectors”'), sampleArticles: t('“Sample articles”') }, { label: 'Tags' }),
      common: fields.object({ onThisPage: t('“On this page”'), makeEnquiry: t('“Make an enquiry”'), scroll: t('“Scroll”'), skipIntro: t('“Skip intro”'), newTab: t('“opens in a new tab”') }, { label: 'Common words' }),
      form: fields.object({
        title: t('Pop-up heading'), intro: tt('Pop-up introduction'),
        name: t('“Your name”'), org: t('“Organisation”'), optional: t('“optional”'), email: t('“Email”'), area: t('“Area of interest”'), other: t('“Something else”'), message: t('“How can we help?”'), consent: tt('Consent text'),
        send: t('Send button'), sending: t('“Sending…”'), again: t('“Write another message”'), close: t('“Close”'),
        errName: t('Error: name'), errEmail: t('Error: email missing'), errEmailFormat: t('Error: email format'), errMessage: t('Error: message too short'), errConsent: t('Error: consent'),
        notConnectedTitle: t('Not connected title'), notConnectedText: tt('Not connected text ({email} = address)'),
        sentTitle: t('Sent title'), sentText: tt('Sent text'), failTitle: t('Failed title'), failText: tt('Failed text ({email} = address)'),
      }, { label: 'Enquiry form' }),
      notFound: fields.object({ title: t('Heading'), text: tt('Text'), home: t('Button') }, { label: 'Page not found' }),
    },
  }),
});

// This file runs both in Node and in the browser (the admin UI), so read the repo setting from
// Vite's import.meta.env (PUBLIC_ prefix) and fall back to process.env when running under Node.
const githubRepo: string | undefined =
  (import.meta as any).env?.PUBLIC_KEYSTATIC_GITHUB_REPO ??
  (typeof process !== 'undefined' ? process.env.PUBLIC_KEYSTATIC_GITHUB_REPO : undefined);

export default config({
  storage: githubRepo ? { kind: 'github', repo: githubRepo as `${string}/${string}` } : { kind: 'local' },
  ui: {
    brand: { name: 'SilkCover admin' },
    navigation: {
      'Whole site': ['global'],
      ...Object.fromEntries(locales.map((l) => [localeNames[l], [`pages_${l}`, `services_${l}`, `sectors_${l}`, `insights_${l}`, `settings_${l}`]])),
    },
  },
  singletons: {
    global: singleton({
      label: 'Contact and form settings',
      path: 'content/global',
      format: { data: 'json' },
      schema: {
        email: t('Enquiry email address'),
        emailPlaceholder: fields.checkbox({ label: 'Email is a placeholder', description: 'Shows a “Placeholder” tag next to the address.', defaultValue: true }),
        formEndpoint: t('Form handler URL', 'Where the enquiry form sends submissions (e.g. a Formspree URL). Leave empty until connected.'),
      },
    }),
    ...Object.assign({}, ...locales.map(settingsFor)),
  },
  collections: Object.assign({}, ...locales.map(collectionsFor)),
});
