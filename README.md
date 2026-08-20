# amilla.es

Personal static portfolio for Antonio Milla, available at [www.amilla.es](https://www.amilla.es/).

The production site is intentionally built with plain HTML, CSS and JavaScript. Development dependencies are used only to generate assets and validate the repository; no framework or third-party JavaScript is shipped to visitors.

## Features

- Responsive single-page portfolio.
- English, Spanish and French versions with localized metadata and `hreflang`.
- Light and dark themes with an accessible manual toggle.
- Theme initialization before styles load to avoid a flash of the wrong theme.
- Reduced-motion support and a layout-stable typewriter animation.
- Self-hosted Manrope and Sora variable fonts.
- Open Graph and Twitter metadata plus `WebSite`, `ProfilePage` and `Person`
  structured data.
- Web app manifest, installable icons and a custom 404 page.
- Security and caching headers configured for Vercel.

## Project structure

```text
public/
├── 404.html
├── index.html
├── es/index.html
├── fr/index.html
├── assets/
│   ├── fonts/
│   ├── icons/
│   └── images/
├── css/styles.css
├── js/
│   ├── script.js
│   └── theme.js
├── robots.txt
├── sitemap.xml
└── site.webmanifest
scripts/
├── generate-assets.mjs
└── verify-site.mjs
```

## Local development

Requirements:

- Node.js 22 or newer.
- Python 3 for the local static server.

Install the development tools and start the site:

```sh
npm install
npm run dev
```

Then open <http://localhost:8000>. Serving the directory over HTTP provides a closer match to production than opening `index.html` as a local file.

## Quality checks

Run the complete local suite:

```sh
npm test
```

This checks formatting, JavaScript, CSS, HTML, local references, production metadata, image dimensions and WCAG contrast ratios. GitHub Actions runs the same suite on every pull request and push to `main`, followed by `npm audit`.

Useful individual commands:

```sh
npm run format
npm run lint
npm run validate:html
npm run verify
```

## Asset generation

The social preview and application icons are generated from the source SVG and favicon. The same command copies the Latin variable-font subsets and their licenses from the development packages:

```sh
npm run assets
```

Commit generated assets together with their source changes. The deployed site does not need `node_modules`.

## Deployment

The repository is configured for Vercel:

- Framework preset: **Other**.
- Build command: none.
- Output directory: `public`.
- Configuration: `vercel.json`.

Only `public/` is deployed. The preferred production hostname is `www.amilla.es`; canonical, social, robots and sitemap URLs must stay aligned with it.

Vercel's **Project settings → Domains** should permanently redirect `amilla.es` to `www.amilla.es`. Verify that the response is `308`, not a temporary `307`, after changing the domain setting.

## Release checklist

1. Run `npm run assets` if fonts, icons or the social preview source changed.
2. Run `npm test` and `npm audit`.
3. Check the page at 320 px, 768 px and desktop widths in both themes.
4. Check keyboard scrolling, visible focus and reduced-motion behavior.
5. Confirm `/`, `/404.html`, `/.well-known/security.txt`, `/robots.txt`, `/sitemap.xml` and `/site.webmanifest` return the expected status and MIME type.
6. Confirm canonical, Open Graph, Twitter and sitemap URLs use `https://www.amilla.es/`.
7. Validate the homepage structured data with Google's Rich Results Test and
   confirm that the `Person` entity contains the full name and both public name
   variants.
8. Inspect production response headers after deployment.

## Security and privacy

The site has no backend, analytics, cookies or third-party runtime resources. `localStorage` stores only the visitor's explicit theme choice. Vercel adds CSP, HSTS, clickjacking, MIME-sniffing, referrer and permissions policies.

HSTS preload is intentionally not requested in the repository. It should only be enabled after the base domain and every subdomain meet the preload requirements and the operational consequences are understood.

## License

Source code, configuration, scripts and the reusable markup structure are
distributed under the MIT license; see `LICENSE`.

The portfolio copy, personal identity and brand-specific visual assets are not
part of that MIT grant. See `CONTENT-LICENSE.md` for the exact scope. Font
licenses are included beside the deployed font files in
`public/assets/fonts/`.
