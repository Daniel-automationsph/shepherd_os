# Shepherd OS — Web MVP

Church Leadership & Management Operating System.
> See the church. Measure the mission. Manage the ministry. Move toward the target.

React + Vite web app covering the full MVP scope: Executive Dashboard, People & Growth,
Life Groups, Geographic Reach, Financial, KPI Center, Reports, and Management Attention.

Geography is mapped to **Pinamalayan, Oriental Mindoro, Philippines (postal code 5208)** —
all 37 barangays, real names and 2020 census populations, rendered on a real
OpenStreetMap-based map (no API key required).

All data is **mock data** (`src/data/mockData.js`) — no backend is wired up yet.

**This is a PWA (Progressive Web App)** — installable to a home screen on Android, iOS,
and desktop, opening full-screen like a native app rather than in a browser tab, with
offline support for previously-viewed screens and map tiles.

**This build was actually compiled and served in a real Node/Vite environment before
being handed to you** (`npm install && npm run build` succeeded, and the built app,
manifest, service worker, and all icon assets were verified to load with real HTTP
requests), not just written and assumed to work.

---

## 1. Local development (instant hot-reload)

```bash
npm install
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`). Every file save hot-reloads
instantly in the browser.

## 2. Push to GitHub

```bash
git init
git add .
git commit -m "Initial Shepherd OS web app"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

## 3. Deploy to Vercel

1. Sign in at [vercel.com](https://vercel.com) with your GitHub account.
2. **Add New → Project → Import** this repo.
3. Vercel auto-detects Vite — defaults are already correct:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`
4. Click **Deploy**. First deploy takes ~1 minute.

**After that, it's fully automatic:**
- Every push to `main` → redeploys your production URL (`your-project.vercel.app`)
- Every push to any other branch, or every pull request → gets its own unique preview
  URL, so you can test changes live before merging, and share a link for feedback
  without touching production.
- Build logs and a live URL show up directly in the GitHub commit/PR checks.

A `vercel.json` is included with a rewrite rule so client-side routes (like
`/life-groups`) work correctly on refresh/direct-link — this is required for any
single-page app on Vercel, not Shepherd-specific.

### Custom domain
Project → Settings → Domains → add yours. Vercel issues an SSL cert automatically.

## 4. Install it as an app (PWA)

Once deployed, open the live Vercel URL on a device:

- **Android (Chrome)**: tap the "Install app" banner, or Menu (⋮) → "Install app" /
  "Add to Home screen"
- **iOS (must be Safari — Chrome on iOS can't install PWAs)**: tap the Share icon →
  "Add to Home Screen"
- **Desktop (Chrome/Edge)**: click the install icon (⊕) in the address bar, or Menu →
  "Install Shepherd OS..."

Installed, it opens full-screen with no browser address bar and its own home screen
icon. The app shell and OpenStreetMap tiles are cached, so previously-viewed screens and
map areas keep working without a live connection.

**Note:** install prompts and the service worker only activate over HTTPS or on
`localhost` — `npm run dev` (plain HTTP) won't show an install prompt, but the deployed
Vercel URL (always HTTPS) will.

## Project structure

```
src/
  main.jsx              # entry point
  App.jsx                 # router (BrowserRouter) + responsive shell
  theme.css               # design tokens (colors, spacing) — single source of truth
  data/mockData.js        # ALL sample data lives here — swap for a real API later
  components/             # KpiStatCard, TrendChart, Sparkline, StatusBadge,
                           # BarangayMap, AttentionTile, AchievementBar, Sidebar
  screens/                # one file per module (Dashboard, People & Growth,
                           # Life Groups, Geographic Reach, Financial, KPI Center,
                           # Reports, Management Attention)
```

## Design notes

- **PWA**: `vite-plugin-pwa` generates the manifest (`public/manifest.webmanifest` at
  build time), service worker, and handles install prompts automatically — no manual
  service worker code needed. Icons are original artwork (a simple chapel glyph in the
  app's own green/gold palette, generated for this project, not any real logo or
  copyrighted mark) at `public/pwa-192.png`, `pwa-512.png`, `pwa-maskable-512.png` (for
  Android's adaptive icon safe-zone), and `apple-touch-icon.png`/`favicon.png` for iOS
  and browser tabs. OpenStreetMap tiles are runtime-cached (`CacheFirst`, 30-day
  expiry) so the map keeps showing previously-viewed areas offline. To change the app
  icon, replace those PNGs and rerun the build — no other code changes needed.
- **Routing** uses `BrowserRouter` for clean URLs (`/life-groups`, not `#/life-groups`)
  — this requires the rewrite rule in `vercel.json` to work on Vercel (already included).
  If you ever move to a static host without rewrite support (e.g. plain GitHub Pages),
  switch back to `HashRouter`.
- **Map**: `react-leaflet` + OpenStreetMap raster tiles, rendering **real barangay
  boundary polygons** (not point markers) for all 37 barangays of Pinamalayan. The
  polygon data (`src/data/pinamalayanBarangays.json`) is sourced from
  [faeldon/philippines-json-maps](https://github.com/faeldon/philippines-json-maps),
  itself built from official PSA/PSGC administrative boundary shapefiles (Dec 2023) via
  [altcoder/philippines-psgc-shapefiles](https://github.com/altcoder/philippines-psgc-shapefiles)
  — this is real surveyed boundary data, the same source GADM's maps use, not a
  placeholder. Barangay names in `mockData.js` were renamed to match the official PSGC
  spelling used in this dataset (e.g. "Sta. Isabel" not "Santa Isabel", "Sto. Niño" not
  "Santo Nino", "Zone I" not "Zone I (Poblacion)") so the outreach stats join correctly
  to the boundary polygons by name. OSM's free tile server is fine for development, not
  for production traffic at scale — swap the `TileLayer` `url` in `BarangayMap.jsx` for a
  paid provider (Mapbox, MapTiler, Stadia Maps) before real production use.
- **Charts**: `recharts` for sparklines and trend lines.
- **KPI status thresholds** (on target ≥100%, needs attention 80–99%, critical <80%) live
  in one function (`statusFromAchievement` in `mockData.js`) so they're easy to make
  configurable later.

## Not yet built

- Backend / persistence (KPI target creation shows a demo alert, doesn't save)
- Auth and the four-tier role-based views (Life Group Leader / Barangay Leader /
  District Leader / Senior Leadership)
- Real barangay GPS coordinates
- Report export (PDF/email), automated alerts, scheduled distribution
