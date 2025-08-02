import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
export default defineConfig([
  {
    languageOptions: { globals: { ...globals.greasemonkey, ...globals.browser } },
    plugins: {
      js,
    },
    extends: ["js/recommended"],
    rules: {
      semi: "error",
      "prefer-const": "error",
    },
  },
]);
