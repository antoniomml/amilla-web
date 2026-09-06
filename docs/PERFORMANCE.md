# Performance baseline

Measured on 6 September 2026 with Lighthouse's default mobile simulation against the local preview at `/es/`:

| Category / metric        | Result    |
| ------------------------ | --------- |
| Performance              | 100 / 100 |
| Accessibility            | 100 / 100 |
| Best practices           | 100 / 100 |
| SEO                      | 100 / 100 |
| First contentful paint   | 0.9 s     |
| Largest contentful paint | 1.7 s     |
| Total blocking time      | 0 ms      |
| Cumulative layout shift  | 0         |
| Speed index              | 1.1 s     |

These are single-run lab results, not field data or a guarantee of production scores. The local server does not reproduce CDN latency, TLS, compression or production cache hits. Browser tests separately check the three languages at multiple widths in light and dark themes. Automated accessibility scores do not certify WCAG conformance.

## Reproduce

Use the committed lockfile and a supported Node.js version:

```sh
npm ci
npm run dev
```

With a local Chrome installation, run in another terminal:

```sh
mkdir -p .lighthouseci
npx lighthouse http://127.0.0.1:8000/es/ --output=html --output=json --output-path=.lighthouseci/report --chrome-flags=--headless --only-categories=performance,accessibility,best-practices,seo
```

Reports are ignored by Git. Repeat against the deployed URL after release to verify actual delivery. Compare several runs under the same conditions before interpreting a small score change.

## Decisions

- Keep the page static and fonts local. There are no runtime dependencies or third-party requests.
- The subtitle is static so its length cannot move the biography during reading. Decorative CSS animation ends after four seconds and is disabled for reduced motion. No pointer physics, JavaScript animation loop or typing timer remains.
- Fingerprint CSS and JavaScript, including the theme initializer, and serve them with immutable caching. Images and fonts retain shorter caching because their filenames are stable.
- Keep the small theme initializer before the stylesheet to apply the saved/system theme before paint. Its blocking request is an intentional tradeoff to avoid a theme flash under the strict CSP.
- Lighthouse still suggests CSS minification and longer font caching. The stylesheet is about 10 KB before compression; these are modest opportunities, not a reason to add a bundler to this site.
