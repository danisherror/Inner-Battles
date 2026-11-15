// `npm run lint` checks the scripts with ESLint's recommended rules (likely mistakes, not layout).
// The scripts wrap localStorage and other calls that may throw in `try { ... } catch (e) {}` on purpose,
// so an empty catch and an unused error are allowed.
const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  { ignores: ["node_modules/"] },
  js.configs.recommended,
  { rules: { "no-empty": ["error", { allowEmptyCatch: true }], "no-unused-vars": ["error", { caughtErrors: "none" }] } },
  { files: ["build.js", "og.js", "eslint.config.js", "*.test.js"], languageOptions: { sourceType: "commonjs", globals: globals.node } },
  { files: ["site.js", "theme.js", "home.js", "progress.js", "reader.js", "compare.js", "redirect.js"], languageOptions: { sourceType: "script", globals: globals.browser } },
  { files: ["sw.js"], languageOptions: { sourceType: "script", globals: globals.serviceworker } },
];
