import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const iconsDirectory = path.join(root, "public/assets/icons");
const fontsDirectory = path.join(root, "public/assets/fonts");
const imagesDirectory = path.join(root, "public/assets/images");
const iconSource = path.join(root, "src/assets/icon.svg");

await Promise.all([
  mkdir(iconsDirectory, { recursive: true }),
  mkdir(fontsDirectory, { recursive: true }),
  mkdir(imagesDirectory, { recursive: true }),
]);

await Promise.all([
  sharp(iconSource, { density: 144 })
    .resize(160, 160)
    .png()
    .toFile(path.join(iconsDirectory, "favicon.png")),
  sharp(iconSource, { density: 144 })
    .resize(180, 180, { fit: "fill" })
    .png()
    .toFile(path.join(iconsDirectory, "apple-touch-icon.png")),
  sharp(iconSource, { density: 144 })
    .resize(192, 192, { fit: "fill" })
    .png()
    .toFile(path.join(iconsDirectory, "icon-192.png")),
  sharp(iconSource, { density: 144 })
    .resize(512, 512, { fit: "fill" })
    .png()
    .toFile(path.join(iconsDirectory, "icon-512.png")),
  sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: "#f7f7f8",
    },
  })
    .composite([
      {
        input: await sharp(iconSource, { density: 144 })
          .resize(350, 350, { fit: "contain" })
          .png()
          .toBuffer(),
        gravity: "center",
      },
    ])
    .png()
    .toFile(path.join(iconsDirectory, "icon-maskable-512.png")),
  sharp(path.join(imagesDirectory, "og-image.svg"))
    .resize(1200, 630, { fit: "fill" })
    .png()
    .toFile(path.join(imagesDirectory, "og-image.png")),
]);

const fontPackages = [
  ["manrope", "manrope-latin-wght-normal.woff2"],
  ["sora", "sora-latin-wght-normal.woff2"],
];

for (const [family, fileName] of fontPackages) {
  const packageDirectory = path.join(
    root,
    `node_modules/@fontsource-variable/${family}`,
  );
  await copyFile(
    path.join(packageDirectory, "files", fileName),
    path.join(fontsDirectory, fileName),
  );
  await copyFile(
    path.join(packageDirectory, "LICENSE"),
    path.join(fontsDirectory, `LICENSE-${family}.txt`),
  );
}

console.log("Generated social image, app icons and local font assets.");
