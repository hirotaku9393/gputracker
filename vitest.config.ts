import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./app/javascript/__tests__/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["app/javascript/**/*.{ts,tsx}"],
      exclude: [
        "app/javascript/application.tsx",
        "app/javascript/__tests__/**",
        "app/javascript/types/**",
      ],
      reporter: ["text", "html"],
      all: true,
    },
  },
  resolve: {
    alias: {
      "@": "/app/javascript",
    },
  },
  esbuild: {
    jsx: "automatic",
  },
});
