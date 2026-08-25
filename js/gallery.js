/**
 * gallery.js — filterable NASA image gallery. Images are hotlinked
 * directly from NASA's own images-assets.nasa.gov CDN (not re-hosted).
 * On load failure, shows a text fallback instead of a broken image.
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

function renderGalleryFilters() {
  const container = document.getElementById('gallery-filters');
  if (!container) return;
  const lang = getLang();
  container.innerHTML = GALLERY_CATEGORIES.map((c) => `
    <button type="button" class="gallery-filter${c.key === galleryActiveFilter ? ' active' : ''}" data-cat="${c.key}">${c[lang]}</button>
  `).join('');
  container.querySelectorAll('.gallery-filter').forEach((btn) => {
    btn.addEventListener('click', () => {
      galleryActiveFilter = btn.dataset.cat;
      renderGalleryFilters();
      renderGalleryGrid();
    });
  });
}

function renderGalleryGrid() {
  const grid = document.getElementById('gallery-grid');
  if (!grid || !VOYAGER_DATA.gallery) return;
  const lang = getLang();
  const items = VOYAGER_DATA.gallery.filter((g) => galleryActiveFilter === 'all' || g.categories.includes(galleryActiveFilter));
  grid.innerHTML = items.map((g) => `
    <figure class="gallery-item">
      <img src="${nasaImageUrl(g.id, 'thumb')}" alt="${g['title_' + lang]}" loading="lazy"
           onerror="this.onerror=null;this.replaceWith(Object.assign(document.createElement('div'),{className:'gallery-fallback',textContent:'${t('gallery.imgUnavailable')}'}));">
      <figcaption>
        <span class="gallery-title">${g['title_' + lang]}</span>
        <span class="gallery-credit">${t('gallery.credit')}: ${g.credit}</span>
        <a href="${nasaImageUrl(g.id, 'orig')}" target="_blank" rel="noopener noreferrer">${t('gallery.viewFull')} ↗</a>
      </figcaption>
    </figure>
  `).join('');
}

function renderGallery() {
  renderGalleryFilters();
  renderGalleryGrid();
}

document.addEventListener('langchange', renderGallery);
