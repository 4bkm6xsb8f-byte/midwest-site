# Midwest Equipment Dock and Lift Services Site

Static marketing website for Midwest Equipment Dock and Lift Services, hosted on GitHub Pages at `www.midwestdockandlift.com`.

## Project Structure

- `index.html` - Primary landing page.
- `services/` - Service-specific landing pages.
- `areas/` - Service-area pages for Northeast Wisconsin locations.
- `guides/` - SEO and customer education articles.
- `privacy.html`, `support.html`, `used-equipment.html`, `404.html` - Supporting pages.
- `styles.css` - Shared styling.
- `assets/site.js` - Shared browser behavior, footer/nav enhancement, analytics calls, FAQ loading, service-area rendering, and estimate form handling.
- `assets/images/` - Logos, icons, project photos, and map assets.
- `CNAME` - GitHub Pages custom domain.
- `sitemap.xml` and `robots.txt` - Search indexing metadata.

## Local Development

This site has no framework, build step, package manager, lint command, or test runner. Open any HTML file directly, or serve the repository root when checking relative paths and browser behavior:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deployment

Pushing to `main` deploys the repository root through `.github/workflows/deploy-pages.yml`. The files committed here are the files published to GitHub Pages.

## Maintenance Notes

- Update `sitemap.xml` when public pages are added, removed, or renamed.
- Keep Open Graph and Twitter Card metadata static on each content page because social crawlers do not run JavaScript.
- Update `assets/site.js` when changing shared navigation, footer behavior, service-area data, backend endpoint integration, or estimate form behavior.
- Keep `CNAME`, canonical URLs, and structured data aligned with `www.midwestdockandlift.com`.
