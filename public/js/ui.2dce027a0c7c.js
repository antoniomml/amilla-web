const root = document.documentElement;
const toggle = document.getElementById("theme-toggle");
const label = toggle?.querySelector(".toggle-label");
const languageMenu = document.querySelector(".language-menu");
const STORAGE_KEY = "portfolio-theme";
const THEME_COLORS = { light: "#f7f7f8", dark: "#11141b" };
const themeColor = document.getElementById("theme-color");
const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
const isErrorPage = document.body.dataset.page === "404";

function getLocaleFromPath() {
  const { pathname } = window.location;

  if (pathname.startsWith("/es/")) {
    return "es";
  }

  if (pathname.startsWith("/fr/")) {
    return "fr";
  }

  return "en";
}

const locale = isErrorPage
  ? getLocaleFromPath()
  : ["es", "fr"].includes(root.lang)
    ? root.lang
    : "en";
const translations = {
  en: {
    darkMode: "Dark mode",
    lightMode: "Light mode",
    enableDarkMode: "Enable dark mode",
    enableLightMode: "Enable light mode",
  },
  es: {
    darkMode: "Modo oscuro",
    lightMode: "Modo claro",
    enableDarkMode: "Activar el modo oscuro",
    enableLightMode: "Activar el modo claro",
  },
  fr: {
    darkMode: "Mode sombre",
    lightMode: "Mode clair",
    enableDarkMode: "Activer le mode sombre",
    enableLightMode: "Activer le mode clair",
  },
};
const copy = translations[locale];
const errorCopy = {
  en: {
    title: "Page not found",
    lead: "The page you are looking for does not exist or has moved.",
    home: "Return home",
    homeHref: "/",
    languageLabel: "Choose language; current language English",
    languageCode: "EN",
    languageNav: "Language",
  },
  es: {
    title: "Página no encontrada",
    lead: "La página que buscas no existe o se ha movido.",
    home: "Volver al inicio",
    homeHref: "/es/",
    languageLabel: "Elegir idioma; idioma actual Español",
    languageCode: "ES",
    languageNav: "Idioma",
  },
  fr: {
    title: "Page introuvable",
    lead: "La page que vous cherchez n'existe pas ou a été déplacée.",
    home: "Retour à l'accueil",
    homeHref: "/fr/",
    languageLabel: "Choisir la langue; langue actuelle Français",
    languageCode: "FR",
    languageNav: "Langue",
  },
};

if (isErrorPage) {
  const pageCopy = errorCopy[locale];

  root.lang = locale;

  const errorTitle = document.getElementById("error-title");
  const errorLead = document.getElementById("error-lead");
  const errorHome = document.getElementById("error-home");

  if (errorTitle) {
    errorTitle.textContent = pageCopy.title;
  }

  if (errorLead) {
    errorLead.textContent = pageCopy.lead;
  }

  if (errorHome) {
    errorHome.textContent = pageCopy.home;
    errorHome.href = pageCopy.homeHref;
  }

  document.title = `${pageCopy.title} — Antonio Milla`;

  if (languageMenu) {
    languageMenu
      .querySelector("nav")
      ?.setAttribute("aria-label", pageCopy.languageNav);
    const summary = languageMenu.querySelector("summary");
    const code = languageMenu.querySelector("[aria-hidden='true']");

    if (summary) {
      summary.setAttribute("aria-label", pageCopy.languageLabel);
    }

    if (code) {
      code.textContent = pageCopy.languageCode;
    }

    for (const link of languageMenu.querySelectorAll("a")) {
      link.removeAttribute("aria-current");

      if (
        (locale === "en" && link.getAttribute("href") === "/") ||
        (locale === "es" && link.getAttribute("href") === "/es/") ||
        (locale === "fr" && link.getAttribute("href") === "/fr/")
      ) {
        link.setAttribute("aria-current", "page");
      }
    }
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Ignore storage errors (private mode, blocked storage, etc.)
  }
}

function setTheme(theme) {
  root.dataset.theme = theme;
  const isDark = theme === "dark";

  if (themeColor) {
    themeColor.setAttribute("content", THEME_COLORS[theme]);
  }

  if (label) {
    label.textContent = isDark ? copy.lightMode : copy.darkMode;
  }

  if (toggle) {
    toggle.setAttribute(
      "aria-label",
      isDark ? copy.enableLightMode : copy.enableDarkMode,
    );
  }
}

setTheme(root.dataset.theme === "dark" ? "dark" : "light");

colorScheme.addEventListener("change", (event) => {
  if (root.dataset.themeSource === "system") {
    setTheme(event.matches ? "dark" : "light");
  }
});

if (toggle) {
  toggle.addEventListener("click", () => {
    const current = root.dataset.theme;
    const next = current === "dark" ? "light" : "dark";

    root.dataset.themeSource = "saved";
    setTheme(next);
    saveTheme(next);
  });
}

if (languageMenu) {
  document.addEventListener("click", (event) => {
    if (
      languageMenu.open &&
      event.target instanceof Node &&
      !languageMenu.contains(event.target)
    ) {
      languageMenu.open = false;
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && languageMenu.open) {
      languageMenu.open = false;
      languageMenu.querySelector("summary")?.focus();
    }
  });
}
