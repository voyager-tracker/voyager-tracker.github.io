/**
 * content.js — Golden Record, Pale Blue Dot, and Data Sources sections.
 * Supports kid-edition "_kid" fields automatically when data-repo-root is set.
 */
function contentField(obj, lang, base) {
  const isKid = document.documentElement.hasAttribute('data-repo-root');
  if (isKid && obj[base + '_' + lang + '_kid']) return obj[base + '_' + lang + '_kid'];
  return obj[base + '_' + lang] || obj[base + '_en'] || '';
}

function renderGoldenRecordAndPBD() {
  const lang = getLang();
  const isKid = document.documentElement.hasAttribute('data-repo-root');
  const mission = VOYAGER_DATA.mission;
  if (!mission) return;

  const grContainer = document.getElementById('golden-record-content');
  if (grContainer && mission.goldenRecord) {
    const gr = mission.goldenRecord;
    const lead = document.createElement('p');
    lead.className = 'lead';
    lead.textContent = contentField(gr, lang, 'summary');

    const ul = document.createElement('ul');
    ul.className = 'content-list';
    (gr.contents || []).forEach((c) => {
      const li = document.createElement('li');
      li.textContent = (isKid && c[lang + '_kid']) || c[lang] || c.en || '';
      ul.appendChild(li);
    });

    const a = document.createElement('a');
    a.className = 'text-link';
    a.href = gr.sourceUrl || '#';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = `${gr.source || 'NASA'} ↗`;

    grContainer.replaceChildren(lead, ul, a);
  }

  const pbdContainer = document.getElementById('pale-blue-dot-content');
  if (pbdContainer && mission.paleBlueDot) {
    const pbd = mission.paleBlueDot;
    const fig = document.createElement('figure');
    fig.className = 'pbd-figure';

    const img = document.createElement('img');
    img.src = nasaImageUrl(pbd.image, 'thumb');
    img.alt = contentField(pbd, lang, 'title');
    img.width = 480;
    img.height = 360;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('error', () => {
      const div = document.createElement('div');
      div.className = 'gallery-fallback';
      div.textContent = t('gallery.imgUnavailable');
      img.replaceWith(div);
    }, { once: true });

    const cap = document.createElement('figcaption');
    cap.textContent = `${t('gallery.credit')}: ${pbd.credit || 'NASA/JPL-Caltech'}`;
    fig.append(img, cap);

    const textWrap = document.createElement('div');
    textWrap.className = 'pbd-text';

    const quote = document.createElement('blockquote');
    quote.className = 'pbd-quote';
    quote.textContent = contentField(pbd, lang, 'quote');

    const summary = document.createElement('p');
    summary.textContent = contentField(pbd, lang, 'summary');

    const link = document.createElement('a');
    link.className = 'text-link';
    link.href = pbd.sourceUrl || '#';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = `${pbd.source || 'NASA'} ↗`;

    textWrap.append(quote, summary, link);
    pbdContainer.replaceChildren(fig, textWrap);
  }
}

function renderSources() {
  const data = VOYAGER_DATA.sources;
  if (!data) return;
  const fillList = (el, items) => {
    if (!el) return;
    const frag = document.createDocumentFragment();
    (items || []).forEach((s) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = s.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = `${s.name} ↗`;
      li.appendChild(a);
      frag.appendChild(li);
    });
    el.replaceChildren(frag);
  };
  fillList(document.getElementById('sources-official'), data.official);
  fillList(document.getElementById('sources-supplementary'), data.supplementary);
}

document.addEventListener('langchange', () => {
  renderGoldenRecordAndPBD();
  renderSources();
});
