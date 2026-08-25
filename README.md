# Voyager 1 & Voyager 2 Tracker（航海家1號與2號｜深空即時追蹤）

An independent, educational, bilingual (English / 繁體中文) data-visualization
site that tracks **both** Voyager spacecraft together — distance from Earth
and the Sun, speed, signal delay, interstellar-space status, mission
timeline, science instruments, and more.

**This is not an official NASA website.** NASA is used strictly as the
primary data source; all figures are labeled **Official**, **Calculated**,
**Estimated**, or **Historical** (see the "Data & Methodology" section on
the site). No live NASA telemetry is faked — distances shown as "live" are
explicitly calculated estimates: an official NASA baseline position plus
the official escape velocity, projected forward by elapsed time.

## Live data sources

- NASA Science — Voyager Mission: https://science.nasa.gov/mission/voyager/
- NASA — Where are Voyager 1 and Voyager 2 Now?: https://science.nasa.gov/mission/voyager/where-are-voyager-1-and-voyager-2-now/
- NASA — Voyager 1 / Voyager 2 / Instruments / Timeline / FAQ pages
- Supplementary: English & 繁體中文 Wikipedia (background reading only)

Full list with links is on the site's **Sources** section
(`#sources` in [index.html](index.html)).

## Project structure

```
index.html            Single-page app: hero, tracker, compare, solar
                       system, timeline, science, golden record,
                       gallery, sources (see nav anchors)
404.html               Signal Lost error page
css/                   style.css, responsive.css, animations.css
js/
  astronomy.js         Physical constants + distance/signal-delay math
  i18n.js              EN / 繁中 translation dictionary + language switch
  data.js              Loads data/*.json with offline-cache fallback
  tracker.js           Dashboard cards, odometers, power, science, status
  compare.js           Comparison table, "who is farther", distance-between
  timeline.js           Dual Voyager 1 / Voyager 2 timeline
  solarsystem.js        2D/3D-toggle schematic solar-system canvas
  gallery.js             Filterable NASA image gallery (hotlinked)
  content.js             Golden Record, Pale Blue Dot, Sources rendering
  app.js                  Starfield, loading sequence, nav, bootstrap
data/
  voyager1.json, voyager2.json   Per-spacecraft NASA-sourced data
  mission.json                    Golden Record, Pale Blue Dot, DSN, updates
  sources.json                    Official + supplementary source links
  gallery.json                    NASA image gallery metadata
  latest-known.json               Offline-fallback cached snapshot
robots.txt, sitemap.xml
```

## Data methodology

- **Official** — figures reported directly by NASA Science / JPL.
- **Calculated** — straightforward unit conversion or math on official
  figures (km ↔ AU, light-travel time).
- **Estimated** — `estimatedDistance = baseDistance + escapeRateAUyr × AU_KM × elapsedYears`,
  projected from the latest official NASA baseline. Explicitly labeled
  `ESTIMATED`, never presented as live telemetry.
- **Historical** — fixed mission facts (launch dates, flybys, interstellar
  crossing dates) from NASA mission records.

The "Distance Between Voyagers" and solar-system map use a simplified 3D
geometric model (fixed escape-trajectory angles from NASA's FAQ), not a
precision JPL Horizons ephemeris — this is disclosed in the Methodology
section.

## Running locally

No build step or backend required — pure HTML/CSS/JS (ES2022+).

```bash
npx serve .
```

(or any static file server — opening `index.html` directly via `file://`
will fail to `fetch()` the JSON data files due to browser CORS
restrictions; use a local server instead.)

## Deploying to GitHub Pages

1. Push this repository to GitHub, to a repo named `<org-or-username>.github.io`.
2. In **Settings → Pages**, set the source to the `main` branch, root folder.
3. The site will be available at `https://<org-or-username>.github.io/`.

## Attribution

- Mission data: NASA Science (https://science.nasa.gov/mission/voyager/)
- Images: NASA/JPL-Caltech, hotlinked directly from NASA's image library
  (images-assets.nasa.gov) — see credit under each image.
- Supplementary reading: Wikipedia (English & 繁體中文)

This project is not affiliated with or endorsed by NASA.
