import path from "node:path";
import babelPlugin from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, type PluginOption, type UserConfig } from "vite";
import viteCompression from "vite-plugin-compression";
import { VitePWA } from "vite-plugin-pwa";

// Three.js components that use direct mutations — skip React Compiler for these
const SKIP_COMPILER = [
  "MLogo",
  "AnimatedStars",
  "TechBox",
  "TechCanvas",
  "CameraRig",
  "UniverseCanvas",
  "LenisFrameSyncer",
  "CustomCursor",
  "ProjectGallery",
];

const getBasePath = (mode: string) =>
  mode === "development" ? undefined : "/portfolio/";

// Plugins from packages built against older Vite versions cause TS2321 (excessive
// stack depth) when TypeScript compares their Plugin type against Vite 8's recursive
// PluginOption. Routing through `unknown` breaks the type chain — assignability to
// `unknown` is trivial and never recurses.
const p = (plugin: unknown): PluginOption => plugin as PluginOption;
const ps = (plugins: unknown): PluginOption[] =>
  plugins as unknown as PluginOption[];

async function getPlugins(mode: string): Promise<PluginOption[]> {
  return [
    ...ps(react()),
    p(
      await babelPlugin({
        plugins: [
          [
            "babel-plugin-react-compiler",
            {
              sources: (filename: string) =>
                SKIP_COMPILER.every((c) => !filename.includes(c)),
            },
          ],
        ],
      }),
    ),
    ...ps(tailwindcss()),
    ...(mode === "analyze"
      ? [
          p(
            visualizer({
              open: true,
              filename: "dist/stats.html",
              gzipSize: true,
              brotliSize: true,
            }),
          ),
        ]
      : []),
    ...ps(
      VitePWA({
        injectRegister: null,
        minify: true,
        includeAssets: [
          "/favicons/favicon.ico",
          "/favicons/favicon.svg",
          "/favicons/apple-touch-icon-180x180.png",
          "/favicons/maskable-icon-512x512.png",
          "/favicons/pwa-64x64.png",
          "/favicons/pwa-192x192.png",
          "/favicons/pwa-512x512.png",
        ],
        manifest: {
          name: "Metwesh | Portfolio",
          short_name: "Portfolio",
          theme_color: "#00eaff",
          background_color: "#080e19",
          display: "standalone",
          scope: getBasePath(mode) ?? "/",
          icons: [
            {
              src: `${getBasePath(mode) ?? "/"}favicons/pwa-64x64.png`,
              sizes: "64x64",
              type: "image/png",
            },
            {
              src: `${getBasePath(mode) ?? "/"}favicons/pwa-192x192.png`,
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: `${getBasePath(mode) ?? "/"}favicons/pwa-512x512.png`,
              sizes: "512x512",
              type: "image/png",
            },
            {
              src: `${getBasePath(mode) ?? "/"}favicons/pwa-512x512.png`,
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: `${getBasePath(mode) ?? "/"}favicons/maskable-icon-512x512.png`,
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,json}"],
          sourcemap: mode === "development",
        },
        devOptions: {
          enabled: true,
        },
        selfDestroying: true,
      }),
    ),
    ...(mode !== "development"
      ? [
          p(
            viteCompression({ algorithm: "gzip", ext: ".gz", threshold: 1024 }),
          ),
          p(
            viteCompression({
              algorithm: "brotliCompress",
              ext: ".br",
              threshold: 1024,
            }),
          ),
        ]
      : []),
  ];
}

export default defineConfig(
  async ({ mode }): Promise<UserConfig> => ({
    base: getBasePath(mode),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["three"],
    },
    build: {
      sourcemap: mode === "development",
    },
    plugins: await getPlugins(mode),
  }),
);
