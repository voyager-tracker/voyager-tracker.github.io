/**
 * timeline.js — dual-track mission timeline (Voyager 1 / Voyager 2).
 * Uses keyboard-accessible buttons and sequential h3 headings.
 */
const TIMELINE_START_YEAR = 1977;
const TIMELINE_END_YEAR = 2027;

function timelinePercent(year) {
  return ((year - TIMELINE_START_YEAR) / (TIMELINE_END_YEAR - TIMELINE_START_YEAR)) * 100;
}

function renderTimelineTrack(containerId, v) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const lang = getLang();
  const events = [...(v.trajectory || [])];

  const heading = document.createElement('h3');
  heading.style.setProperty('--accent', v.color);
  heading.textContent = v.name[lang] || v.name.en;

  const track = document.createElement('div');
  track.className = 'timeline-track';
  track.style.setProperty('--accent', v.color);

  const line = document.createElement('div');
  line.className = 'timeline-line';
  line.setAttribute('aria-hidden', 'true');
  track.appendChild(line);

  events.forEach((e) => {
    const label = e['label_' + lang] || e.label_en || '';
    const item = document.createElement('div');
    item.className = 'timeline-event';
    item.style.left = `${timelinePercent(e.year)}%`;

    const dotBtn = document.createElement('button');
    dotBtn.type = 'button';
    dotBtn.className = 'timeline-dot';
    dotBtn.setAttribute('aria-label', `${e.year}: ${label}`);

    const tip = document.createElement('div');
    tip.className = 'timeline-tooltip';
    const strong = document.createElement('strong');
    strong.textContent = `${e.year} `;
    const span = document.createElement('span');
    span.textContent = label;
    tip.append(strong, span);

    item.append(dotBtn, tip);
    track.appendChild(item);
  });

  container.replaceChildren(heading, track);
}

function renderTimeline() {
  if (!VOYAGER_DATA.voyager1) return;
  renderTimelineTrack('timeline-v1', VOYAGER_DATA.voyager1);
  renderTimelineTrack('timeline-v2', VOYAGER_DATA.voyager2);
}

document.addEventListener('langchange', renderTimeline);
