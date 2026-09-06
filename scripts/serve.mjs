// Local preview of the static output, including production redirects and headers.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";

const config = JSON.parse(await readFile("vercel.json", "utf8"));
const root = path.resolve("public");
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".webmanifest": "application/manifest+json",
};
const port = Number(process.env.PORT || 8000);
createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    if (!["GET", "HEAD"].includes(request.method)) {
      response.writeHead(405, { Allow: "GET, HEAD" });
      response.end();
      return;
    }
    for (const rule of config.headers) {
      if (new RegExp(`^${rule.source}$`).test(pathname)) {
        for (const header of rule.headers)
          response.setHeader(header.key, header.value);
      }
    }
    const redirect = config.redirects.find((rule) => rule.source === pathname);
    if (redirect) {
      response.writeHead(308, { Location: redirect.destination });
      response.end();
      return;
    }
    const rewritten =
      config.rewrites.find((rule) => rule.source === pathname)?.destination ??
      pathname;
    const relative = rewritten.endsWith("/")
      ? `${rewritten}index.html`
      : rewritten;
    let filename = path.resolve(root, `.${relative}`);
    if (!filename.startsWith(`${root}${path.sep}`)) {
      response.writeHead(400);
      response.end();
      return;
    }
    let body;
    try {
      body = await readFile(filename);
    } catch {
      filename = path.join(root, "404.html");
      body = await readFile(filename);
      response.statusCode = 404;
    }
    response.setHeader(
      "Content-Type",
      types[path.extname(filename)] ?? "application/octet-stream",
    );
    response.end(request.method === "HEAD" ? undefined : body);
  } catch {
    response.writeHead(400);
    response.end();
  }
}).listen(port, "127.0.0.1", () =>
  console.log(`Preview: http://127.0.0.1:${port}`),
);
