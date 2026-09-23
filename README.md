<p align="center">
  <a href="https://amilla.es/">
    <img src="public/assets/images/og-image.png" alt="Antonio Milla — personal portfolio" width="760">
  </a>
</p>

<h1 align="center">amilla.es</h1>

<p align="center">
  Personal portfolio for Antonio Milla, built with the web platform and no runtime dependencies.
</p>

<p align="center">
  <a href="https://amilla.es/"><img alt="Production" src="https://img.shields.io/website?url=https%3A%2F%2Familla.es%2F&up_message=online&down_message=offline&label=production&style=flat-square"></a>
  <a href="https://github.com/antoniomml/amilla-web/actions/workflows/quality.yml"><img alt="Quality checks" src="https://github.com/antoniomml/amilla-web/actions/workflows/quality.yml/badge.svg"></a>
  <a href="https://github.com/antoniomml/amilla-web/releases/latest"><img alt="Latest release" src="https://img.shields.io/github/v/release/antoniomml/amilla-web?style=flat-square&label=release"></a>
  <a href="LICENSE"><img alt="Code license: MIT" src="https://img.shields.io/badge/code%20license-MIT-2ea44f?style=flat-square"></a>
  <img alt="Stack: HTML, CSS and JavaScript" src="https://img.shields.io/badge/stack-HTML%20%7C%20CSS%20%7C%20JavaScript-555?style=flat-square">
</p>

<p align="center">
  <a href="https://amilla.es/">Visit the website</a>
  ·
  <a href="https://github.com/antoniomml/amilla-web/releases/latest">Latest release</a>
</p>

## About

The production site is intentionally built with plain HTML, CSS and JavaScript. Development dependencies are used only to generate assets and validate the repository; no framework or third-party JavaScript is shipped to visitors.

|                          |                                               |
| ------------------------ | --------------------------------------------- |
| **Languages**            | English, Spanish and French                   |
| **Hosting**              | Vercel                                        |
| **Production output**    | `public/`                                     |
| **Runtime dependencies** | None                                          |
| **Privacy**              | No analytics, cookies or third-party requests |

## Highlights

- Responsive, multilingual single-page portfolio with localized metadata and `hreflang`.
- Light and dark themes with an accessible manual toggle.
- A looping typewriter subtitle and floating background shapes. The typed line pauses and resumes when clicked; `prefers-reduced-motion` freezes both.
- Self-hosted Manrope and Sora variable fonts.
- Open Graph, Twitter and structured metadata for rich previews and search engines.
- Web app manifest, installable icons and a custom 404 page.
- Strict CSP, HSTS and supporting browser security policies configured for Vercel.

## Local development

Requirements: Node.js 22.22+ (22.x), or Node.js 24.8+. These match the validation tools’ supported versions.

```sh
npm ci
npm run dev
```

Open <http://localhost:8000>. Serving the site over HTTP provides a closer match to production than opening `index.html` directly.

## Quality and security

Run the complete local suite:

```sh
npm test
```

The suite rebuilds the site and checks formatting, JavaScript, CSS, HTML, local references (including the 404), production metadata, asset fingerprints, image dimensions and text/hover contrast in both themes.

For browser checks:

```sh
npx playwright install chromium
npm run test:browser
```

Browser tests cover all three languages in both themes at 320, 375 and 1280 px, axe accessibility checks, keyboard navigation, theme persistence, reduced motion, typewriter pause and resume, JavaScript-disabled content, localized 404s and local previews of response headers and redirects. GitHub Actions runs these checks for every pull request and push to `main`, followed by `npm audit`. Automated checks complement manual visual and assistive-technology testing.

GitHub security settings were verified on 6 September 2026; see [SECURITY.md](SECURITY.md) for their scope and the private reporting channel. Actions use immutable SHA references. The deployed site has no backend, analytics, cookies or third-party runtime resources; `localStorage` stores only the visitor's explicit theme choice.

## Project layout

<details>
<summary>View the repository structure</summary>

```text
src/
├── page.html             # Shared localized page template
├── 404.html              # Error page template
├── content/              # Metadata/translations and localized biographies
├── css/                  # Original stylesheet
├── js/                   # Theme initialization and interface behavior
└── assets/icon.svg       # Vector source for all application icons
public/                   # Deployable pages and assets
scripts/                  # Build, asset generation, preview and verification
tests/                    # Browser and accessibility regression checks
```

</details>

## Assets and deployment

Generate the social preview, application icons and local font assets with:

```sh
npm run assets
```

Run `npm run build` after changing source files. Vercel runs this command and deploys only `public/`, using the headers and routing rules in `vercel.json`. The canonical production hostname is [amilla.es](https://amilla.es/).

## Performance

See [the measured production baseline and reproduction steps](docs/PERFORMANCE.md). Lab scores are single-run checks, not field data.

## Editing and maintenance

- Edit page layout in `src/page.html`, biographies in `src/content/{en,es,fr}.html`, and translated metadata/labels in `src/content/locales.json`. Keep all three biographies factually aligned. The 404 translations live in `src/js/ui.js`.
- Edit CSS and JavaScript under `src/`. The build writes content-hashed filenames to `public/css/` and `public/js/` and updates every page automatically. These files use a one-year immutable cache; non-fingerprinted images and fonts use shorter caching.
- Generated HTML, CSS and JavaScript in `public/` are committed for transparent review, but should not be edited directly. Run `npm run format`, `npm run build` and `npm test`, then include the resulting output and `vercel.json` in the same change. CI checks that rebuilding produces no tracked differences.
- Structured metadata and its CSP hashes are generated together. Changes to biography text do not require manually updating CSP.
- Run `npm run assets` after editing `src/assets/icon.svg` or `public/assets/images/og-image.svg`, or updating the font packages. Icons are rendered directly from the vector original. Run `npm run build` afterwards.
- Keep `public/.well-known/security.txt` current before its expiration date. Review dependency updates with `npm audit`; do not use forced upgrades without checking compatibility.
- The local preview binds to `127.0.0.1` and reproduces configured redirects, security headers and 404 status. It does not emulate Vercel's CDN, TLS, compression or cache behavior. Verify those on deployment.
- Canonical routes are `/`, `/es/` and `/fr/`; explicit permanent redirects normalize their index-file and slashless variants. The `www`-to-apex redirect is managed in the Vercel domain settings.

The role, biography and profile links remain available without JavaScript. The typewriter and background shapes are decorative: they pause when the typed line is clicked, freeze under `prefers-reduced-motion`, and stop while the tab is hidden. There is no claim about a current employer beyond the experience described in the biography.

## License

Source code, configuration, scripts and reusable markup are available under the [MIT License](LICENSE).

Portfolio copy, personal identity and brand-specific visual assets are excluded from that grant. See [CONTENT-LICENSE.md](CONTENT-LICENSE.md) for the exact scope. Third-party font licenses are included beside the deployed font files.
