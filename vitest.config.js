import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./app/javascript/__tests__/setup.js"],
    coverage: {
      provider: "v8",
      include: ["app/javascript/**/*.{js,jsx}"],
      exclude: [
        "app/javascript/application.jsx",
        "app/javascript/__tests__/**",
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
