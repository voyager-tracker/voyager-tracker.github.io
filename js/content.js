/**
 * content.js — Golden Record, Pale Blue Dot, and Data Sources sections.
 */
function renderGoldenRecordAndPBD() {
  const lang = getLang();
  const mission = VOYAGER_DATA.mission;
  if (!mission) return;

  const grContainer = document.getElementById('golden-record-content');
  if (grContainer && mission.goldenRecord) {
    const gr = mission.goldenRecord;
    grContainer.innerHTML = `
      <p class="lead">${gr['summary_' + lang]}</p>
      <ul class="content-list">
        ${(gr.contents || []).map((c) => `<li>${c[lang]}</li>`).join('')}
      </ul>
      <a class="text-link" href="${gr.sourceUrl}" target="_blank" rel="noopener noreferrer">${gr.source} ↗</a>
    `;
  }

  const pbdContainer = document.getElementById('pale-blue-dot-content');
  if (pbdContainer && mission.paleBlueDot) {
    const pbd = mission.paleBlueDot;
    pbdContainer.innerHTML = `
      <figure class="pbd-figure">
        <img src="${nasaImageUrl(pbd.image, 'thumb')}" alt="${pbd['title_' + lang]}" loading="lazy"
             onerror="this.onerror=null;this.replaceWith(Object.assign(document.createElement('div'),{className:'gallery-fallback',textContent:'${t('gallery.imgUnavailable')}'}));">
        <figcaption>${t('gallery.credit')}: ${pbd.credit}</figcaption>
      </figure>
      <div class="pbd-text">
        <p class="pbd-quote">${pbd['quote_' + lang]}</p>
        <p>${pbd['summary_' + lang]}</p>
        <a class="text-link" href="${pbd.sourceUrl}" target="_blank" rel="noopener noreferrer">${pbd.source} ↗</a>
      </div>
    `;
  }
}

function renderSources() {
  const lang = getLang();
  const data = VOYAGER_DATA.sources;
  if (!data) return;
  const officialEl = document.getElementById('sources-official');
  const suppEl = document.getElementById('sources-supplementary');
  if (officialEl) {
    officialEl.innerHTML = data.official.map((s) => `
      <li><a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.name} ↗</a></li>
    `).join('');
  }
  if (suppEl) {
    suppEl.innerHTML = data.supplementary.map((s) => `
      <li><a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.name} ↗</a></li>
    `).join('');
  }
}

document.addEventListener('langchange', () => { renderGoldenRecordAndPBD(); renderSources(); });
