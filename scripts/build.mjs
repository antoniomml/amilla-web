import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { format } from "prettier";

const read = (file) => readFile(file, "utf8");
const hash = (value, encoding = "hex") =>
  createHash("sha256").update(value).digest(encoding);
const escape = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
const origin = "https://www.amilla.es";
const paths = { en: "/", es: "/es/", fr: "/fr/" };
const names = { en: "English", es: "Español", fr: "Français" };
const locales = JSON.parse(await read("src/content/locales.json"));
const template = await read("src/page.html");
const assets = {};

// Only these generated directories are cleared; original assets live in src/.
for (const directory of ["css", "js"]) {
  await mkdir(`public/${directory}`, { recursive: true });
  for (const file of await readdir(`public/${directory}`)) {
    if (/\.(css|js)$/.test(file)) await rm(`public/${directory}/${file}`);
  }
}
for (const [key, source] of Object.entries({
  cssAsset: "css/styles.css",
  themeAsset: "js/theme.js",
  uiAsset: "js/ui.js",
})) {
  const contents = await read(`src/${source}`);
  const target = source.replace(
    /\.(css|js)$/,
    `.${hash(contents).slice(0, 12)}.$1`,
  );
  await writeFile(`public/${target}`, contents);
  assets[key] = `/${target}`;
}

function render(source, values) {
  return source.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!(key in values)) throw new Error(`Missing template value: ${key}`);
    return values[key];
  });
}
const cspHashes = [];
for (const [language, copy] of Object.entries(locales)) {
  const canonical = `${origin}${paths[language]}`;
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        url: `${origin}/`,
        name: "Antonio Milla",
        alternateName: "amilla.es",
        inLanguage: Object.keys(paths),
      },
      {
        "@type": "ProfilePage",
        "@id": `${canonical}#profile-page`,
        url: canonical,
        name: copy.title,
        inLanguage: language,
        isPartOf: { "@id": `${origin}/#website` },
        mainEntity: { "@id": `${origin}/#person` },
      },
      {
        "@type": "Person",
        "@id": `${origin}/#person`,
        name: "Antonio Manuel Milla Lara",
        alternateName: ["Antonio Milla", "Antonio Milla Lara"],
        url: `${origin}/`,
        jobTitle: copy.role,
        description: copy.socialDescription,
        sameAs: [
          "https://www.linkedin.com/in/antoniomilla/",
          "https://github.com/antoniomml",
        ],
        alumniOf: {
          "@type": "EducationalOrganization",
          name: "Universidad de Jaén",
        },
      },
    ],
  };
  const html = await format(
    render(template, {
      ...Object.fromEntries(
        Object.entries(copy).map(([key, value]) => [key, escape(value)]),
      ),
      ...assets,
      language,
      canonical,
      languageCode: language.toUpperCase(),
      biography: await read(`src/content/${language}.html`),
      structuredData: JSON.stringify(graph, null, 2).replaceAll("<", "\\u003c"),
      ogLocales: Object.entries(locales)
        .map(
          ([key, value]) =>
            `<meta property="og:locale${key === language ? "" : ":alternate"}" content="${escape(value.locale)}" />`,
        )
        .join("\n"),
      languageLinks: Object.entries(paths)
        .map(
          ([key, pathname]) =>
            `<a href="${pathname}" lang="${key}" hreflang="${key}"${key === language ? ' aria-current="page"' : ""}>${names[key]}</a>`,
        )
        .join("\n"),
    }),
    { parser: "html" },
  );
  cspHashes.push(
    `'sha256-${hash(html.match(/<script id="structured-data" type="application\/ld\+json">([\s\S]*?)<\/script>/)[1], "base64")}'`,
  );
  await mkdir(`public${paths[language]}`, { recursive: true });
  await writeFile(`public${paths[language]}index.html`, html);
}
await writeFile(
  "public/404.html",
  await format(render(await read("src/404.html"), assets), { parser: "html" }),
);
const config = JSON.parse(await read("vercel.json"));
const csp = config.headers
  .flatMap((entry) => entry.headers)
  .find((entry) => entry.key === "Content-Security-Policy");
csp.value = csp.value.replace(
  /script-src [^;]+;/,
  `script-src 'self' ${cspHashes.join(" ")};`,
);
await writeFile(
  "vercel.json",
  await format(JSON.stringify(config), { parser: "json" }),
);
console.log(
  "Built three localized pages, 404, fingerprinted assets and CSP hashes.",
);
