import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const publicDirectory = path.join(root, "public");
const expectedOrigin = "https://www.amilla.es";
const languagePaths = { en: "/", es: "/es/", fr: "/fr/" };

const readText = (filePath) => readFile(path.join(root, filePath), "utf8");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function pngDimensions(buffer) {
  assert(buffer.toString("ascii", 1, 4) === "PNG", "Expected a PNG file");
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function luminance(hex) {
  const channels = [1, 3, 5]
    .map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255)
    .map((value) =>
      value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
    );
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(foreground, background) {
  const values = [luminance(foreground), luminance(background)];
  return (Math.max(...values) + 0.05) / (Math.min(...values) + 0.05);
}

const [
  indexHtml,
  spanishHtml,
  frenchHtml,
  css,
  robots,
  sitemap,
  manifestText,
  vercelText,
] = await Promise.all([
  readText("public/index.html"),
  readText("public/es/index.html"),
  readText("public/fr/index.html"),
  readText("src/css/styles.css"),
  readText("public/robots.txt"),
  readText("public/sitemap.xml"),
  readText("public/site.webmanifest"),
  readText("vercel.json"),
]);
const manifest = JSON.parse(manifestText);
const vercelConfiguration = JSON.parse(vercelText);
const pages = [
  { html: indexHtml, language: "en", pathname: "/" },
  { html: spanishHtml, language: "es", pathname: "/es/" },
  { html: frenchHtml, language: "fr", pathname: "/fr/" },
];

assert(
  robots.includes(`${expectedOrigin}/sitemap.xml`),
  "robots.txt sitemap URL is inconsistent",
);

const contentSecurityPolicy = vercelConfiguration.headers
  .flatMap((entry) => entry.headers)
  .find((header) => header.key === "Content-Security-Policy")?.value;
const localReferences = new Set();

for (const page of pages) {
  const canonicalUrl = `${expectedOrigin}${page.pathname}`;
  const runtimeReferences = [
    ...page.html.matchAll(/(?:href|src)="([^"]+)"/g),
  ].map((match) => match[1]);

  assert(
    page.html.includes(`<html lang="${page.language}">`),
    `${page.pathname} must declare its language`,
  );
  assert(
    page.html.includes(`<link rel="canonical" href="${canonicalUrl}"`),
    `${page.pathname} canonical URL is inconsistent`,
  );
  assert(
    page.html.includes(`${expectedOrigin}/assets/images/og-image.png`),
    `${page.pathname} social metadata must use the PNG preview`,
  );
  assert(
    runtimeReferences.every(
      (reference) =>
        new URL(reference, expectedOrigin).hostname !== "fonts.googleapis.com",
    ),
    "Google Fonts must not be loaded at runtime",
  );

  for (const [language, pathname] of Object.entries(languagePaths)) {
    assert(
      page.html.includes(
        `hreflang="${language}" href="${expectedOrigin}${pathname}"`,
      ),
      `${page.pathname} is missing the ${language} alternate`,
    );
  }

  const structuredDataSource = page.html.match(
    /<script id="structured-data" type="application\/ld\+json">([\s\S]*?)<\/script>/,
  )?.[1];
  assert(structuredDataSource, `${page.pathname} structured data is missing`);

  const structuredData = JSON.parse(structuredDataSource);
  const graph = structuredData["@graph"];
  assert(Array.isArray(graph), "Structured data must contain an @graph array");

  const website = graph.find((entry) => entry["@type"] === "WebSite");
  const profilePage = graph.find((entry) => entry["@type"] === "ProfilePage");
  const person = graph.find((entry) => entry["@type"] === "Person");
  assert(website?.name === "Antonio Milla", "WebSite name is inconsistent");
  assert(
    profilePage?.url === canonicalUrl &&
      profilePage?.inLanguage === page.language,
    `${page.pathname} ProfilePage localization is inconsistent`,
  );
  assert(
    profilePage?.mainEntity?.["@id"] === `${expectedOrigin}/#person`,
    "ProfilePage must reference the Person entity",
  );
  assert(
    person?.name === "Antonio Manuel Milla Lara",
    "Person must use the full name",
  );
  assert(
    ["Antonio Milla", "Antonio Milla Lara"].every((name) =>
      person?.alternateName?.includes(name),
    ),
    "Person alternate names are incomplete",
  );
  assert(
    [
      "https://www.linkedin.com/in/antoniomilla/",
      "https://github.com/antoniomml",
    ].every((profile) => person?.sameAs?.includes(profile)),
    "Person profiles are incomplete",
  );

  const structuredDataHash = createHash("sha256")
    .update(structuredDataSource)
    .digest("base64");
  assert(
    contentSecurityPolicy?.includes(`'sha256-${structuredDataHash}'`),
    `${page.pathname} structured data is blocked by the CSP`,
  );

  for (const reference of runtimeReferences.filter((value) =>
    value.startsWith("/"),
  )) {
    const referencePath = reference.split(/[?#]/)[0];

    if (!referencePath.endsWith("/")) {
      localReferences.add(referencePath);
    }
  }
}

for (const pathname of Object.values(languagePaths)) {
  assert(
    sitemap.includes(`<loc>${expectedOrigin}${pathname}</loc>`),
    `${pathname} is missing from the sitemap`,
  );
}

for (const reference of localReferences) {
  await access(path.join(publicDirectory, reference));
}

const securityTxt = await readFile(
  path.join(publicDirectory, ".well-known/security.txt"),
  "utf8",
);
assert(
  securityTxt.includes("Contact:"),
  "security.txt must include a Contact field",
);
assert(
  securityTxt.includes("Expires:"),
  "security.txt must include an Expires field",
);
assert(
  securityTxt.includes(`Canonical: ${expectedOrigin}/.well-known/security.txt`),
  "security.txt canonical URL must match the production origin",
);

for (const icon of manifest.icons) {
  const iconPath = path.join(publicDirectory, icon.src);
  const dimensions = pngDimensions(await readFile(iconPath));
  const [expectedWidth, expectedHeight] = icon.sizes.split("x").map(Number);
  assert(
    dimensions.width === expectedWidth && dimensions.height === expectedHeight,
    `${icon.src} is ${dimensions.width}x${dimensions.height}, expected ${icon.sizes}`,
  );
}

const socialImage = pngDimensions(
  await readFile(path.join(publicDirectory, "assets/images/og-image.png")),
);
assert(
  socialImage.width === 1200 && socialImage.height === 630,
  "Social image must be 1200x630",
);

for (const [theme, block] of [
  ["light", css.match(/:root \{([\s\S]*?)\n\}/)?.[1]],
  ["dark", css.match(/html\[data-theme="dark"\] \{([\s\S]*?)\n\}/)?.[1]],
]) {
  assert(block, `${theme} theme is missing`);
  const colors = Object.fromEntries(
    [...block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{3,6});/gi)].map(
      ([, key, value]) => [
        key,
        value.length === 4
          ? `#${[...value.slice(1)].map((digit) => digit + digit).join("")}`
          : value,
      ],
    ),
  );
  for (const variable of [
    "text",
    "muted",
    "accent-1",
    "accent-2",
    "accent-3",
    "accent-4",
    "accent-5",
  ]) {
    assert(
      contrast(colors[variable], colors.bg) >= 4.5,
      `${theme}: ${variable} must meet 4.5:1 against the background`,
    );
  }
  for (const variable of ["accent-1", "accent-3", "accent-4"]) {
    assert(
      contrast(colors["highlight-ink"], colors[variable]) >= 4.5,
      `${theme}: hovered highlight ${variable} must meet 4.5:1`,
    );
  }
}
const errorHtml = await readText("public/404.html");
assert(errorHtml.includes('content="noindex"'), "404 must not be indexed");
for (const html of [...pages.map((page) => page.html), errorHtml]) {
  assert(!html.includes("{{"), "Unresolved template placeholder");
  for (const [, reference] of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
    const pathname = reference.split(/[?#]/)[0];
    await access(
      path.join(
        publicDirectory,
        pathname,
        pathname.endsWith("/") ? "index.html" : "",
      ),
    );
    if (/^\/(css|js)\//.test(pathname)) {
      assert(
        /\.[0-9a-f]{12}\.(css|js)$/.test(pathname),
        `Asset is not fingerprinted: ${pathname}`,
      );
      const contents = await readFile(path.join(publicDirectory, pathname));
      assert(
        pathname.includes(
          createHash("sha256").update(contents).digest("hex").slice(0, 12),
        ),
        `Stale asset hash: ${pathname}`,
      );
    }
  }
}
assert(
  Date.parse(securityTxt.match(/^Expires: (.+)$/m)?.[1]) > Date.now(),
  "security.txt has expired",
);
for (const pathname of [
  "/index.html",
  "/es",
  "/es/index.html",
  "/fr",
  "/fr/index.html",
]) {
  assert(
    vercelConfiguration.redirects.some(
      (rule) => rule.source === pathname && rule.permanent,
    ),
    `Missing permanent redirect: ${pathname}`,
  );
}

console.log(
  `Verified ${pages.length} localized pages, ${localReferences.size} local references, metadata, image dimensions and color contrast.`,
);
