# Security policy

## Reporting a vulnerability

Please use [GitHub private vulnerability reporting](https://github.com/antoniomml/amilla-web/security/advisories/new). This channel is enabled for this repository. Include the affected URL or file, reproduction steps and the expected impact. Do not publish credentials or sensitive information in a public issue.

The supported version is the current `main` branch. Please allow time for investigation before public disclosure; no response-time guarantee is offered.

## Scope

The deployed website serves static HTML, CSS, JavaScript and local assets. It has no backend, accounts, analytics, cookies or third-party runtime requests. The only stored visitor preference is the theme in `localStorage`.

Development dependencies are used for generation, linting, browser tests and performance measurement. Dependency advisories should be assessed in that context: they do not automatically imply a vulnerability reachable by a website visitor.

CSP, HSTS and other response headers are configured in `vercel.json`. `npm run build` calculates the CSP hashes from the final structured metadata. Do not edit these hashes manually or weaken the policy to accommodate a change.

## Repository controls

As verified on 6 September 2026, GitHub has CodeQL default setup, Dependabot security updates, secret scanning, push protection and private vulnerability reporting enabled. These settings are managed on GitHub and should be reviewed when transferring or forking the repository. A fork does not inherit this assurance.

The quality workflow uses pinned action SHAs and read-only repository permissions. Scheduled Dependabot version updates are configured in `.github/dependabot.yml`.
