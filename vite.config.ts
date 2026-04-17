import path from "node:path";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import viteCompression from "vite-plugin-compression";

const getBasePath = (mode: string) =>
  mode === "development" ? undefined : "/portfolio/";

const compressionPlugins = (mode: string) =>
  mode !== "development"
    ? [
        viteCompression({
          algorithm: "gzip",
          ext: ".gz",
          threshold: 1024,
        }),
        viteCompression({
          algorithm: "brotliCompress",
          ext: ".br",
          threshold: 1024,
        }),
      ]
    : [];

const visualizerPlugin = (mode: string) =>
  mode === "analyze"
    ? [
        visualizer({
          open: true,
          filename: "dist/stats.html",
          gzipSize: true,
          brotliSize: true,
        }),
      ]
    : [];

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => ({
  base: getBasePath(mode),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["three"],
  },
  devtools: {
    enabled: mode === "development",
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (
            id.includes("three") ||
            id.includes("@react-three/fiber") ||
            id.includes("@react-three/drei")
          )
            return "three";
          if (id.includes("@react-spring/three")) return "animation";
          if (id.includes("gsap")) return "gsap";
          if (id.includes("lenis")) return "lenis";
          if (id.includes("react-dom") || id.includes("react/"))
            return "vendor";
        },
      },
    },
    sourcemap: mode === "development",
  },
  plugins: [
    react(),
    babel({
      presets: [reactCompilerPreset()],
    }),
    tailwindcss({
      optimize: {
        minify: mode !== "development",
      },
    }),
    ...visualizerPlugin(mode),
    ...compressionPlugins(mode),
  ],
}));
