import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // React plugin not needed for vitest - JSX transform is handled by esbuild
  plugins: [],
  test: {
    globals: true,
    environment: "happy-dom",
    // Shares one happy-dom instance across test files in a worker instead of
    // spinning up a fresh one per file — that setup cost was 44% of total
    // run time on a 6-file, 20-test suite. Safe here: no test file mutates
    // shared/global state (DOM globals, modules) in a way another file
    // depends on being reset.
    isolate: false,
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/dist/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "@hashintel/refractive": path.resolve(
        import.meta.dirname,
        "./src/test/mocks/refractive.tsx",
      ),
    },
    dedupe: ["three"],
  },
});
