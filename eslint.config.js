import js from "@eslint/js";
import vue from "eslint-plugin-vue";
import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs["flat/recommended"],
  {
    files: ["src/**/*.vue"],
    languageOptions: { parserOptions: { parser: tseslint.parser, extraFileExtensions: [".vue"] } },
  },
  {
    files: ["src/**/*.{ts,vue}"],
    rules: {
      "no-undef": "off",
      "@typescript-eslint/no-explicit-any": "error",
      "vue/max-attributes-per-line": "off",
      "vue/singleline-html-element-content-newline": "off",
      "vue/html-self-closing": "off",
      "vue/html-closing-bracket-newline": "off",
      "vue/html-indent": "off",
    },
  },
  { ignores: ["dist", "node_modules"] },
];
