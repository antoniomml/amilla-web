const root = document.documentElement;
const toggle = document.getElementById("theme-toggle");
const label = toggle?.querySelector(".toggle-label");
const languageMenu = document.querySelector(".language-menu");
const typewriterText = document.getElementById("typewriter-text");
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
    phrases: [
      "at Ryanair",
      "working with AWS, Azure and GCP",
      "hardening cloud workloads",
      "designing least-privilege IAM",
      "automating security controls",
      "improving detection and response",
    ],
  },
  es: {
    darkMode: "Modo oscuro",
    lightMode: "Modo claro",
    enableDarkMode: "Activar el modo oscuro",
    enableLightMode: "Activar el modo claro",
    phrases: [
      "en Ryanair",
      "trabajando con AWS, Azure y GCP",
      "protegiendo entornos cloud",
      "aplicando least privilege en IAM",
      "automatizando controles de seguridad",
      "trabajando en Detection & Response",
    ],
  },
  fr: {
    darkMode: "Mode sombre",
    lightMode: "Mode clair",
    enableDarkMode: "Activer le mode sombre",
    enableLightMode: "Activer le mode clair",
    phrases: [
      "chez Ryanair",
      "avec AWS, Azure et GCP",
      "sécurisant des environnements cloud",
      "appliquant le principe du moindre privilège",
      "automatisant les contrôles de sécurité",
      "améliorant la détection et la réponse",
    ],
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
  },
  es: {
    title: "Página no encontrada",
    lead: "La página que buscas no existe o se ha movido.",
    home: "Volver al inicio",
    homeHref: "/es/",
    languageLabel: "Elegir idioma; idioma actual Español",
    languageCode: "ES",
  },
  fr: {
    title: "Page introuvable",
    lead: "La page que vous cherchez n'existe pas ou a été déplacée.",
    home: "Retour à l'accueil",
    homeHref: "/fr/",
    languageLabel: "Choisir la langue; langue actuelle Français",
    languageCode: "FR",
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

const { phrases } = copy;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const prefersReducedMotion = reducedMotion.matches;
const shapeTypes = [
  "triangle",
  "circle",
  "square",
  "circle",
  "triangle",
  "square",
];
const shapeField = document.createElement("div");

shapeField.className = "ambient-shapes";
shapeField.setAttribute("aria-hidden", "true");

shapeTypes.forEach((shapeType, index) => {
  const shape = document.createElement("span");

  shape.className = [
    "ambient-shape",
    `ambient-shape-${shapeType}`,
    `ambient-shape-${index + 1}`,
  ].join(" ");
  shapeField.append(shape);
});

document.body.prepend(shapeField);

const shapes = [...shapeField.querySelectorAll(".ambient-shape")];
const touchingShapes = new Set();
const maxShapeOffsets = [140, 140, 120, 150, 130, 130];
const shapeMasses = [1.45, 1.55, 1.25, 0.8, 0.95, 0.85];
const shapeMotion = shapes.map((shape, index) => {
  const motionAnimation =
    typeof shape.animate === "function"
      ? shape.animate(
          [
            { transform: "translate3d(0, 0, 0) rotate(0deg)" },
            { transform: "translate3d(0, 0, 0) rotate(0deg)" },
          ],
          { duration: 1000, fill: "both" },
        )
      : null;

  motionAnimation?.pause();

  if (motionAnimation) {
    motionAnimation.currentTime = 0;
  }

  return {
    shape,
    motionAnimation,
    maxOffset: maxShapeOffsets[index],
    mass: shapeMasses[index],
    x: 0,
    y: 0,
    velocityX: 0,
    velocityY: 0,
    angle: 0,
    angularVelocity: 0,
  };
});
let pendingPointerPosition = null;
let pointerFrameId = null;
let motionFrameId = null;
let lastMotionTime = null;
let previousPointerPosition = null;

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function renderShapeMotion(state) {
  const transform = `translate3d(${state.x.toFixed(3)}px, ${state.y.toFixed(
    3,
  )}px, 0) rotate(${state.angle.toFixed(3)}deg)`;

  state.motionAnimation?.effect?.setKeyframes([{ transform }, { transform }]);
}

function resetShapeMotion() {
  if (motionFrameId !== null) {
    window.cancelAnimationFrame(motionFrameId);
    motionFrameId = null;
  }

  lastMotionTime = null;

  for (const state of shapeMotion) {
    state.x = 0;
    state.y = 0;
    state.velocityX = 0;
    state.velocityY = 0;
    state.angle = 0;
    state.angularVelocity = 0;
    renderShapeMotion(state);
  }
}

function animateShapeMotion(timestamp) {
  const frameScale =
    lastMotionTime === null
      ? 1
      : clamp((timestamp - lastMotionTime) / (1000 / 60), 0.25, 2.5);
  const movementDamping = 0.994 ** frameScale;
  const rotationDamping = 0.991 ** frameScale;
  let hasActiveMotion = false;

  lastMotionTime = timestamp;

  for (const state of shapeMotion) {
    state.velocityX -= state.x * 0.00065 * frameScale;
    state.velocityY -= state.y * 0.00065 * frameScale;
    state.angularVelocity -= state.angle * 0.0008 * frameScale;
    state.velocityX *= movementDamping;
    state.velocityY *= movementDamping;
    state.angularVelocity *= rotationDamping;
    state.x += state.velocityX * frameScale;
    state.y += state.velocityY * frameScale;
    state.angle += state.angularVelocity * frameScale;

    const distanceFromOrigin = Math.hypot(state.x, state.y);

    if (distanceFromOrigin > state.maxOffset) {
      const normalX = state.x / distanceFromOrigin;
      const normalY = state.y / distanceFromOrigin;
      const boundaryForce =
        (distanceFromOrigin - state.maxOffset) * 0.0022 * frameScale;

      state.velocityX -= normalX * boundaryForce;
      state.velocityY -= normalY * boundaryForce;
    }

    const isMoving =
      Math.abs(state.velocityX) > 0.01 ||
      Math.abs(state.velocityY) > 0.01 ||
      Math.abs(state.angularVelocity) > 0.005 ||
      Math.abs(state.x) > 0.15 ||
      Math.abs(state.y) > 0.15 ||
      Math.abs(state.angle) > 0.08;

    if (isMoving) {
      hasActiveMotion = true;
    } else {
      state.x = 0;
      state.y = 0;
      state.velocityX = 0;
      state.velocityY = 0;
      state.angle = 0;
      state.angularVelocity = 0;
    }

    renderShapeMotion(state);
  }

  if (hasActiveMotion && !reducedMotion.matches) {
    motionFrameId = window.requestAnimationFrame(animateShapeMotion);
  } else {
    motionFrameId = null;
    lastMotionTime = null;
  }
}

function startShapeMotion() {
  if (motionFrameId === null && !reducedMotion.matches) {
    motionFrameId = window.requestAnimationFrame(animateShapeMotion);
  }
}

function pointTouchesShape(shape, x, y) {
  const bounds = shape.getBoundingClientRect();

  if (
    bounds.width === 0 ||
    bounds.height === 0 ||
    x < bounds.left ||
    x > bounds.right ||
    y < bounds.top ||
    y > bounds.bottom
  ) {
    return false;
  }

  const normalizedX = (x - bounds.left) / bounds.width;
  const normalizedY = (y - bounds.top) / bounds.height;

  if (shape.classList.contains("ambient-shape-circle")) {
    return (normalizedX - 0.5) ** 2 + (normalizedY - 0.5) ** 2 <= 0.25;
  }

  if (shape.classList.contains("ambient-shape-triangle")) {
    return normalizedY >= Math.abs(normalizedX - 0.5) * 2;
  }

  return true;
}

function addShapeImpulse(state, pointer) {
  if (!state.motionAnimation) {
    return;
  }

  const bounds = state.shape.getBoundingClientRect();
  const offsetX = pointer.x - (bounds.left + bounds.width / 2);
  const offsetY = pointer.y - (bounds.top + bounds.height / 2);
  const pointerVelocityX = pointer.velocityX * (1000 / 60);
  const pointerVelocityY = pointer.velocityY * (1000 / 60);
  const pointerSpeed = Math.hypot(pointerVelocityX, pointerVelocityY);
  let impulseX;
  let impulseY;

  if (pointerSpeed > 0.35) {
    const impulseScale = Math.min(1, 4.25 / pointerSpeed);

    impulseX = pointerVelocityX * impulseScale;
    impulseY = pointerVelocityY * impulseScale;
  } else {
    const distanceFromCenter = Math.max(1, Math.hypot(offsetX, offsetY));

    impulseX = (-offsetX / distanceFromCenter) * 2.2;
    impulseY = (-offsetY / distanceFromCenter) * 2.2;
  }

  impulseX /= state.mass;
  impulseY /= state.mass;
  state.velocityX = clamp(state.velocityX + impulseX, -9, 9);
  state.velocityY = clamp(state.velocityY + impulseY, -9, 9);

  const relativeX = offsetX / Math.max(1, bounds.width / 2);
  const relativeY = offsetY / Math.max(1, bounds.height / 2);
  const torque = relativeX * impulseY - relativeY * impulseX;

  state.angularVelocity = clamp(
    state.angularVelocity + torque * 0.32,
    -2.4,
    2.4,
  );
  startShapeMotion();
}

function updateShapeInteraction(event) {
  if (reducedMotion.matches) {
    return;
  }

  const timestamp = event.timeStamp || performance.now();
  const elapsed = previousPointerPosition
    ? clamp(timestamp - previousPointerPosition.timestamp, 4, 80)
    : 1000 / 60;

  pendingPointerPosition = {
    x: event.clientX,
    y: event.clientY,
    velocityX: previousPointerPosition
      ? (event.clientX - previousPointerPosition.x) / elapsed
      : 0,
    velocityY: previousPointerPosition
      ? (event.clientY - previousPointerPosition.y) / elapsed
      : 0,
  };
  previousPointerPosition = {
    x: event.clientX,
    y: event.clientY,
    timestamp,
  };

  if (pointerFrameId !== null) {
    return;
  }

  pointerFrameId = window.requestAnimationFrame(() => {
    if (pendingPointerPosition) {
      const pointer = pendingPointerPosition;

      for (const state of shapeMotion) {
        const isTouching = pointTouchesShape(state.shape, pointer.x, pointer.y);

        if (isTouching && !touchingShapes.has(state.shape)) {
          addShapeImpulse(state, pointer);
        }

        if (isTouching) {
          touchingShapes.add(state.shape);
        } else {
          touchingShapes.delete(state.shape);
        }
      }
    }

    pointerFrameId = null;
  });
}

if (window.matchMedia("(any-pointer: fine)").matches) {
  window.addEventListener("pointermove", updateShapeInteraction, {
    passive: true,
  });
  document.documentElement.addEventListener("pointerleave", () => {
    touchingShapes.clear();
    previousPointerPosition = null;
  });
  window.addEventListener("blur", () => {
    touchingShapes.clear();
    previousPointerPosition = null;
  });
  reducedMotion.addEventListener("change", (event) => {
    if (event.matches) {
      touchingShapes.clear();
      previousPointerPosition = null;
      resetShapeMotion();
    }
  });
}

if (typewriterText) {
  if (prefersReducedMotion) {
    typewriterText.textContent = phrases[0];
  } else {
    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const typeSpeed = 85;
    const deleteSpeed = 55;
    const pauseOnWord = 1200;
    const pauseBeforeNext = 260;
    let timeoutId;

    const scheduleTick = (delay) => {
      window.clearTimeout(timeoutId);

      if (!document.hidden) {
        timeoutId = window.setTimeout(tick, delay);
      }
    };

    const tick = () => {
      const currentPhrase = phrases[phraseIndex];

      if (deleting) {
        charIndex -= 1;
      } else {
        charIndex += 1;
      }

      typewriterText.textContent = currentPhrase.slice(
        0,
        Math.max(0, charIndex),
      );

      let delay = deleting ? deleteSpeed : typeSpeed;

      if (!deleting && charIndex >= currentPhrase.length) {
        deleting = true;
        delay = pauseOnWord;
      } else if (deleting && charIndex <= 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        delay = pauseBeforeNext;
      }

      scheduleTick(delay);
    };

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        window.clearTimeout(timeoutId);
      } else {
        scheduleTick(pauseBeforeNext);
      }
    });

    tick();
  }
}
