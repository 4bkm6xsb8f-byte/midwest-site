# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static marketing website for Midwest Equipment Dock and Lift Services (a lakefront dock/lift business in Northeast Wisconsin). Plain HTML, CSS, and one vanilla-JS file — no framework, no build step, no package manager, no tests. Hosted on GitHub Pages at the custom domain in `CNAME` (`www.midwestdockandlift.com`).

## Build / run / deploy

- **Run locally:** open any `.html` directly, or serve the repo root so relative paths and `fetch` work: `python3 -m http.server 8000` then visit `http://localhost:8000`.
- **No build, lint, or test commands exist.** Editing a file *is* the change.
- **Deploy:** pushing to `main` triggers `.github/workflows/deploy-pages.yml`, which uploads the entire repo root (`path: .`) as the Pages artifact and deploys it. There is no transformation — the files you commit are exactly what ships. Anything added to the repo root is publicly served.

## Architecture

### Pages are independent HTML files sharing one CSS file and one script
Every page is hand-authored HTML that links `styles.css` and `assets/site.js`. There is no templating, so shared chrome (header markup, fonts, brand) is **duplicated** across pages — a change to the visible header must be made in each HTML file. Page groups:
- Root: `index.html` (the main one-page site), plus `privacy.html`, `support.html`, `used-equipment.html`.
- `services/`, `guides/`, `areas/` — landing/SEO sub-pages. These sit one directory deep and reference shared assets with `../` (e.g. `../assets/site.js`, `../styles.css`).

### `assets/site.js` progressively enhances every page
A single script loaded on all pages. On load it runs a fixed sequence (bottom of the file) that **injects DOM rather than relying on it being hand-coded**, so most pages can ship minimal `<body>` markup:
- `ensureFavicons`, `ensureStaffNavLink` (adds Facebook + Staff Login links to `.site-nav`), `ensureFooter` (builds `.site-footer` if absent — **every** page including `index.html` now relies on this; there is no hand-coded footer), `initMobileNav` (injects the `.mobile-nav-toggle` hamburger, breakpoint 760px), `updateCurrentYear` (fills every `[data-current-year]` span with `new Date().getFullYear()` — the single, identical copyright-year mechanism site-wide).
- `initServiceAreaMap` — renders a Leaflet map into `#service-area-map` from `SERVICE_AREA_LOCATIONS`. Leaflet is loaded from the unpkg CDN in the HTML `<head>`; if it fails to load the function writes a `.map-fallback` message instead.
- `renderServiceAreaNames` — see "Served-lakes single source" below.
- `trackPageView` / `loadFaqs` — talk to the backend (see below).
- Estimate form handler — only binds if `#estimate-form` exists (it lives in `index.html`).

`pathPrefix()` is the key to this working from any directory: it returns `"../"` when the URL path matches `/(guides|services|areas)/` and `""` otherwise, and every injected asset URL is built with it. **If you add a new nested directory of pages, update the regex in `pathPrefix()`** or injected favicons/footer links will 404.

### Backend integration (separate app, not in this repo)
`assets/site.js` posts to a separate dashboard app at `https://app.midwestdockandlift.com` via three endpoints declared at the top of the file: `/api/analytics/page-view`, `/api/public/sales-inquiries`, `/api/public/faqs`. The estimate form submits **multipart `FormData`** (it remaps the form field names to the API's `full_name`/`primary_phone`/`service_type`/… schema and appends up to 5 photo files). FAQs load progressively — the hand-coded FAQ cards in `index.html` are the fallback when the endpoint is unreachable.

### Served-lakes single source
`SERVICE_AREA_LOCATIONS` in `site.js` drives the served-lakes data. `renderServiceAreaNames()` derives two things from it at runtime: the visible `.lake-grid` (the `[data-lake-grid]` container in `index.html`, populated with the `"Served lake"` entries sorted alphabetically) and the JSON-LD `areaServed` array (rewritten in place from the same list, with `, Wisconsin` appended plus the `"Northeast Wisconsin"` region). **To change which lakes are served, edit `SERVICE_AREA_LOCATIONS`** — the map, the grid, and the rendered structured data all follow.
- For crawler safety, `index.html`'s static JSON-LD `areaServed` carries the **full list too** (so non-JS crawlers see it); the JS rewrite overwrites it with the array-derived version on load to keep the rendered DOM in sync. The static list is generated from the array — if you change the array, regenerate it (sort `"Served lake"` names alphabetically, append `, Wisconsin`, then `"Northeast Wisconsin"`). It's the one copy that can drift for pure-non-JS crawlers, so keep them aligned.

### SEO / social assets maintained by hand
- `sitemap.xml` (**update when you add/remove a page** — `staff-login.html`, `used-equipment.html`, and `404.html` are intentionally excluded as redirect/noindex pages), `robots.txt`, and the JSON-LD `LocalBusiness` block in `index.html`'s `<head>`.
- **Open Graph / Twitter Card** meta tags are static in every content page's `<head>` (social scrapers don't run JS, so these must stay static). Each new page needs its own `og:title`/`og:description`/`og:url` plus the shared `og:image` (`assets/images/header-banner.png`). `staff-login.html` (redirect) and `404.html` omit them by design.
- **`404.html`** is GitHub Pages' auto-served not-found page. It is the one page that uses **root-absolute paths** (`/styles.css`, `/assets/...`, `/index.html`) because it renders at arbitrary URL depths.
- Below-the-fold `<img>`s use `loading="lazy" decoding="async"`; the above-fold `.brand-logo` is intentionally left eager (don't lazy-load it or other LCP images).

### Favicon cache-busting
Favicon/icon links use a `?v=YYYYMMDD` query string. The version is `FAVICON_VERSION` in `site.js` (used by the injected links) **and** hardcoded in the static `<link>` tags in every HTML `<head>`. All pages are currently unified at `v=20260601`. When you replace an icon, bump `FAVICON_VERSION` and every static `?v=` tag together so browsers refetch (a repo-wide find/replace of the old version string is the reliable way). Each page carries the same four static icon links — `svg`, `png 32x32`, `apple-touch-icon`, `shortcut icon`.

## Conventions

- Vanilla browser JS only (no bundler, no npm). Keep `site.js` defensive: guard every DOM lookup (`instanceof` / null checks) since it runs on every page regardless of which elements exist.
- Contact info is repeated as literal strings (phone `920-319-3625`, `info@midwestdockandlift.com`, the Facebook URL, the dashboard URL). Update all occurrences together.
- `staff-login.html` is a thin redirect to the dashboard (`https://app.midwestdockandlift.com`) via meta-refresh + `location.replace`, marked `noindex`. The nav "Staff Login" links point straight at the dashboard, so this page is only a fallback for anyone hitting the bare URL.
