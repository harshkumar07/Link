import eslint from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  { ignores: ["**/node_modules/**", "**/build/**", "**/dist/**", "**/.react-router/**", "**/coverage/**", "**/.vercel/**"] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
    rules: {
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      "@typescript-eslint/no-explicit-any": "error"
    }
  },
  { files: ["**/*.test.ts", "**/*.spec.ts", "vitest.config.ts"], rules: { "@typescript-eslint/no-explicit-any": "off" } },
  prettier
);
