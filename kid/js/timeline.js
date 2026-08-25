/**
 * timeline.js — dual-track mission timeline (Voyager 1 / Voyager 2),
 * built from the trajectory + interstellar fields in the NASA-sourced
 * data files. Positions are linearly scaled by year, 1977–2026.
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
  const events = [...v.trajectory];
  container.innerHTML = `
    <h4 style="--accent:${v.color}">${v.name[lang]}</h4>
    <div class="timeline-track" style="--accent:${v.color}">
      <div class="timeline-line"></div>
      ${events.map((e) => `
        <div class="timeline-event" style="left:${timelinePercent(e.year)}%">
          <span class="timeline-dot"></span>
          <div class="timeline-tooltip">
            <strong>${e.year}</strong>
            <span>${e['label_' + lang]}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderTimeline() {
  if (!VOYAGER_DATA.voyager1) return;
  renderTimelineTrack('timeline-v1', VOYAGER_DATA.voyager1);
  renderTimelineTrack('timeline-v2', VOYAGER_DATA.voyager2);
}

document.addEventListener('langchange', renderTimeline);
