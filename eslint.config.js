import prettierConfig from "eslint-config-prettier";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        fetch: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        AbortController: "readonly",
        Response: "readonly",
      },
    },
    rules: {
      "no-console": "warn",
      "no-unused-vars": "error",
      "no-var": "error",
      "prefer-const": "error",
      eqeqeq: "warn",
    },
  },
  prettierConfig,
];
