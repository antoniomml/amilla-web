# Performance baseline

Measured on 6 September 2026 with Lighthouse 13.4.1's default mobile simulation against production at [https://amilla.es/es/](https://amilla.es/es/):

| Category / metric        | Result    |
| ------------------------ | --------- |
| Performance              | 100 / 100 |
| Accessibility            | 100 / 100 |
| Best practices           | 100 / 100 |
| SEO                      | 100 / 100 |
| First contentful paint   | 0.9 s     |
| Largest contentful paint | 1.2 s     |
| Total blocking time      | 0 ms      |
| Cumulative layout shift  | 0         |
| Speed index              | 0.9 s     |

These are single-run lab results, not field data or a guarantee of future scores. Browser tests separately check the three languages at multiple widths in light and dark themes. Automated accessibility scores do not certify WCAG conformance.

## Reproduce

Against production:

```sh
mkdir -p .lighthouseci
npx lighthouse https://amilla.es/es/ --output=html --output=json --output-path=.lighthouseci/report --chrome-flags=--headless --only-categories=performance,accessibility,best-practices,seo
```

For a local comparison, use the committed lockfile and a supported Node.js version:

```sh
npm ci
npm run dev
```

Then point Lighthouse at `http://127.0.0.1:8000/es/`. The local server does not reproduce CDN latency, TLS, compression or production cache hits.

Reports are ignored by Git. Compare several runs under the same conditions before interpreting a small score change.

## Decisions

- Keep the page static and fonts local. There are no runtime dependencies or third-party requests.
- Keep the typewriter and floating background shapes. The subtitle reserves height so changing phrase length does not push the biography. Clicking the typed line pauses or resumes it; `prefers-reduced-motion` shows the first phrase statically and disables shape motion; a hidden tab stops the typing timer.
- Fingerprint CSS and JavaScript, including the theme initializer, and serve them with immutable caching. Images and fonts retain shorter caching because their filenames are stable.
- Keep the small theme initializer before the stylesheet to apply the saved/system theme before paint. Its blocking request is an intentional tradeoff to avoid a theme flash under the strict CSP.
- The stylesheet is about 10 KB before compression. That is not a reason to add a bundler to this site.
