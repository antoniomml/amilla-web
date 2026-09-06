import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const locales = { en: "/", es: "/es/", fr: "/fr/" };
for (const [language, url] of Object.entries(locales)) {
  for (const colorScheme of ["light", "dark"]) {
    test(`${language} ${colorScheme}: accessible at mobile and desktop widths`, async ({
      page,
    }) => {
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      const resources = [];
      page.on("request", (request) => resources.push(request.url()));
      await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
      await page.goto(url);
      await expect(page.locator("html")).toHaveAttribute("lang", language);
      await expect(page.locator("html")).toHaveAttribute(
        "data-theme",
        colorScheme,
      );
      for (const width of [320, 375, 1280]) {
        await page.setViewportSize({ width, height: 812 });
        const result = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze();
        expect(result.violations).toEqual([]);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
        ).toBe(true);
        await expect(page.locator(".profile-links")).toBeInViewport();
      }
      expect(
        resources.every((resource) =>
          resource.startsWith("http://127.0.0.1:8000/"),
        ),
      ).toBe(true);
      expect(errors).toEqual([]);
    });
  }
}

test("keyboard menu, language navigation and saved theme", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.locator("summary")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("details")).toHaveAttribute("open", "");
  await page.keyboard.press("Escape");
  await expect(page.locator("details")).not.toHaveAttribute("open", "");
  await expect(page.locator("summary")).toBeFocused();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.locator("summary").click();
  await page.getByRole("link", { name: "Español", exact: true }).click();
  await expect(page).toHaveURL("/es/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("animations finish, reduced motion responds live, and layout is stable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 812 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/fr/");
  const before = await page.locator(".bio").boundingBox();
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            document
              .getAnimations()
              .filter((animation) => animation.playState === "running").length,
        ),
      { timeout: 6500 },
    )
    .toBe(0);
  expect((await page.locator(".bio").boundingBox()).y).toBe(before.y);
  await page.reload();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document
            .getAnimations()
            .filter((animation) => animation.playState === "running").length,
      ),
    )
    .toBe(0);
});

test("content and language selection work without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:8000/es/");
  await expect(page.locator(".specialty")).toContainText("automatización");
  await expect(page.locator("#theme-toggle")).toBeHidden();
  await page.locator("summary").click();
  await page.getByRole("link", { name: "Français", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await context.close();
});

for (const [language, label] of [
  ["es", "Idioma"],
  ["fr", "Langue"],
]) {
  test(`${language}: real localized 404`, async ({ page }) => {
    const response = await page.goto(`/${language}/missing-page`);
    expect(response.status()).toBe(404);
    await expect(page.locator("html")).toHaveAttribute("lang", language);
    await expect(page.locator(".language-options")).toHaveAttribute(
      "aria-label",
      label,
    );
    await expect(page.locator("#error-home")).toHaveAttribute(
      "href",
      `/${language}/`,
    );
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  });
}

test("canonical redirects and cache/security headers", async ({ request }) => {
  for (const [source, destination] of [
    ["/index.html", "/"],
    ["/es", "/es/"],
    ["/es/index.html", "/es/"],
    ["/fr", "/fr/"],
    ["/fr/index.html", "/fr/"],
  ]) {
    const response = await request.get(source, { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toBe(destination);
  }
  const page = await request.get("/");
  expect(page.headers()["content-security-policy"]).toContain(
    "frame-ancestors 'none'",
  );
  const css = (await page.text()).match(/href="(\/css\/[^"]+)"/)[1];
  expect((await request.get(css)).headers()["cache-control"]).toContain(
    "immutable",
  );
});

test("system theme changes are followed until a manual choice", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.locator("#theme-toggle").click();
  await page.emulateMedia({ colorScheme: "light" });
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("theme selection still works when browser storage is blocked", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Storage blocked", "SecurityError");
      },
    });
  });
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/es/");
  await page.locator("#theme-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
