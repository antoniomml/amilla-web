import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: [
      "node_modules/**",
      ".lighthouseci/**",
      "public/js/**",
      "test-results/**",
      "playwright-report/**",
    ],
  },
  js.configs.recommended,
  { files: ["tests/**/*.js"], languageOptions: { globals: globals.browser } },
  {
    files: ["src/js/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: globals.browser,
    },
  },
  {
    files: ["scripts/**/*.mjs", "*.config.js", "tests/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node,
    },
  },
];
