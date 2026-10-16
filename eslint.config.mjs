import js from "@eslint/js";
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";
import reactHooks from "eslint-plugin-react-hooks";

/**
 * Flat ESLint config. Native flat presets only - no legacy .eslintrc shim -
 * so `eslint .` runs non-interactively in CI. The old `next lint` script
 * prompted for setup on a fresh clone and hung.
 *
 * The `@next/next` plugin is registered in an unscoped block so that the
 * `next build` plugin-detection check finds it.
 */
export default tseslint.config(
  { ignores: [".next/**", "out/**", "node_modules/**", "next-env.d.ts", "docs/PULP*/**"] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    plugins: { "@next/next": nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },

  reactHooks.configs.flat["recommended-latest"],

  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

  {
    files: ["tools/**", "*.mjs", "*.config.*"],
    languageOptions: {
      // Node 20+ globals used by the build scripts under tools/.
      globals: {
        fetch: "readonly",
        console: "readonly",
        URL: "readonly",
        process: "readonly",
        Buffer: "readonly",
        setTimeout: "readonly",
        WebSocket: "readonly",
      },
    },
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
);
