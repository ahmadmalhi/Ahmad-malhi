const nextPlugin = require("eslint-config-next");

module.exports = [
  { ignores: [".next/**", "node_modules/**", "out/**"] },
  ...nextPlugin,
  {
    // These react-hooks rules target React Compiler compatibility and are
    // stricter than the app needs: they flag standard, safe patterns like
    // generating an id/timestamp inside an event handler, or hydrating
    // state from localStorage once on mount. Downgraded to warnings so
    // real issues are still visible without blocking builds on non-issues.
    rules: {
      "react-hooks/purity": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
    },
  },
];
