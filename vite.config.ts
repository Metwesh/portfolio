import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { visualizer } from "rollup-plugin-visualizer";
import viteCompression from "vite-plugin-compression";
import path from "path";

const getBasePath = (mode: string) =>
  mode === "development" ? undefined : "/portfolio/";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: getBasePath(mode),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three", "@react-three/fiber", "@react-three/drei"],
          vendor: ["react", "react-dom"],
          gsap: ["gsap", "@react-spring/three"],
        },
      },
    },
    sourcemap: mode === "development",
  },
  plugins: [
    react({
      babel: {
        plugins: [
          [
            "babel-plugin-react-compiler",
            {
              // Skip Three.js components that require direct mutations
              sources: (filename: string) => {
                return (
                  filename.indexOf("MLogo") === -1 &&
                  filename.indexOf("AnimatedStars") === -1 &&
                  filename.indexOf("TechBox") === -1 &&
                  filename.indexOf("TechCanvas") === -1
                );
              },
            },
          ],
        ],
      },
    }),
    tailwindcss(),
    ...(mode === "analyze"
      ? [
          visualizer({
            open: true,
            filename: "dist/stats.html",
            gzipSize: true,
            brotliSize: true,
          }) as Plugin,
        ]
      : []),
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
    // Compression plugins for production
    ...(mode !== "development"
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
      : []),
  ],
}));
