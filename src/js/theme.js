(() => {
  const root = document.documentElement;
  const storageKey = "portfolio-theme";
  const themeColors = { light: "#f7f7f8", dark: "#11141b" };

  let savedTheme = null;

  try {
    const storedValue = localStorage.getItem(storageKey);
    savedTheme =
      storedValue === "light" || storedValue === "dark" ? storedValue : null;
  } catch {
    // Storage may be unavailable in private or restricted browsing contexts.
  }

  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
  const initialTheme = savedTheme ?? systemTheme;

  root.dataset.theme = initialTheme;
  root.dataset.themeSource = savedTheme ? "saved" : "system";
  document
    .querySelector("#theme-color")
    ?.setAttribute("content", themeColors[initialTheme]);
})();
