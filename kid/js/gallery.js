/**
 * gallery.js — filterable NASA image gallery. Images are hotlinked
 * directly from NASA's own images-assets.nasa.gov CDN (not re-hosted).
 * Uses safe DOM construction and addEventListener('error') fallbacks.
 */
const GALLERY_CATEGORIES = [
  { key: 'all', en: 'All', zh: '全部', es: 'Todo', ja: 'すべて' },
  { key: 'voyager1', en: 'Voyager 1', zh: '航海家1號', es: 'Voyager 1', ja: 'ボイジャー1号' },
  { key: 'voyager2', en: 'Voyager 2', zh: '航海家2號', es: 'Voyager 2', ja: 'ボイジャー2号' },
  { key: 'launch', en: 'Launch', zh: '發射', es: 'Lanzamiento', ja: '打ち上げ' },
  { key: 'spacecraft', en: 'Spacecraft', zh: '太空船', es: 'Sonda espacial', ja: '探査機' },
  { key: 'uranus', en: 'Uranus', zh: '天王星', es: 'Urano', ja: '天王星' },
  { key: 'jupiter', en: 'Jupiter', zh: '木星', es: 'Júpiter', ja: '木星' },
  { key: 'saturn', en: 'Saturn', zh: '土星', es: 'Saturno', ja: '土星' },
  { key: 'neptune', en: 'Neptune', zh: '海王星', es: 'Neptuno', ja: '海王星' },
  { key: 'pale-blue-dot', en: 'Pale Blue Dot', zh: '淡藍色小點', es: 'Pálido Punto Azul', ja: 'ペイル・ブルー・ドット' },
  { key: 'golden-record', en: 'Golden Record', zh: '金唱片', es: 'Disco de Oro', ja: 'ゴールデンレコード' },
  { key: 'interstellar', en: 'Interstellar Space', zh: '星際空間', es: 'Espacio interestelar', ja: '星間空間' }
];

let galleryActiveFilter = 'all';

function nasaImageUrl(id, size) {
  return `https://images-assets.nasa.gov/image/${id}/${id}~${size}.jpg`;
}

function attachImgFallback(img, fallbackText) {
  img.addEventListener('error', () => {
    const div = document.createElement('div');
    div.className = 'gallery-fallback';
    div.textContent = fallbackText;
    img.replaceWith(div);
  }, { once: true });
}

function renderGalleryFilters() {
  const container = document.getElementById('gallery-filters');
  if (!container) return;
  const lang = getLang();
  const frag = document.createDocumentFragment();
  GALLERY_CATEGORIES.forEach((c) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `gallery-filter${c.key === galleryActiveFilter ? ' active' : ''}`;
    btn.dataset.cat = c.key;
    btn.setAttribute('aria-pressed', c.key === galleryActiveFilter ? 'true' : 'false');
    btn.textContent = c[lang] || c.en;
    btn.addEventListener('click', () => {
      galleryActiveFilter = c.key;
      renderGalleryFilters();
      renderGalleryGrid();
    });
    frag.appendChild(btn);
  });
  container.replaceChildren(frag);
}

function renderGalleryGrid() {
  const grid = document.getElementById('gallery-grid');
  if (!grid || !VOYAGER_DATA.gallery) return;
  const lang = getLang();
  const isKid = document.documentElement.hasAttribute('data-repo-root');
  const items = VOYAGER_DATA.gallery.filter(
    (g) => galleryActiveFilter === 'all' || g.categories.includes(galleryActiveFilter)
  );
  const frag = document.createDocumentFragment();
  items.forEach((g) => {
    const title = (isKid && g['title_' + lang + '_kid']) || g['title_' + lang] || g.title_en || '';
    const fig = document.createElement('figure');
    fig.className = 'gallery-item';

    const img = document.createElement('img');
    img.src = nasaImageUrl(g.id, 'thumb');
    img.alt = title;
    img.width = 400;
    img.height = 300;
    img.loading = 'lazy';
    img.decoding = 'async';
    attachImgFallback(img, t('gallery.imgUnavailable'));

    const cap = document.createElement('figcaption');
    const titleSpan = document.createElement('span');
    titleSpan.className = 'gallery-title';
    titleSpan.textContent = title;

    const creditSpan = document.createElement('span');
    creditSpan.className = 'gallery-credit';
    creditSpan.textContent = `${t('gallery.credit')}: ${g.credit}`;

    const link = document.createElement('a');
    link.href = nasaImageUrl(g.id, 'orig');
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = `${t('gallery.viewFull')} ↗`;

    cap.append(titleSpan, creditSpan, link);
    fig.append(img, cap);
    frag.appendChild(fig);
  });
  grid.replaceChildren(frag);
}

function renderGallery() {
  renderGalleryFilters();
  renderGalleryGrid();
}

document.addEventListener('langchange', renderGallery);
