import js from "@eslint/js";
import globals from "globals";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: "latest", sourceType: "module", ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node, React: "readonly", JSX: "readonly" },
    },
    plugins: { "@typescript-eslint": tsPlugin, react },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      "no-undef": "off",
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "react/prop-types": "off",
    },
    settings: { react: { version: "detect" } },
  },
  { ignores: ["dist/**", "node_modules/**", "*.config.*"] },
];
