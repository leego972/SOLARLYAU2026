import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";


const plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime()];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      external: [
        "@stripe/stripe-js",
        "@stripe/react-stripe-js",
        "stripe",
        "driver.js",
        "wouter",
        "lucide-react",
        "streamdown",
        "sonner",
        "react",
        "react-dom",
        "react-hook-form",
        "@tanstack/react-query",
        "@trpc/client",
        "@trpc/react-query",
        "framer-motion",
        "date-fns",
        "zod",
        "nanoid",
        "clsx",
        "tailwind-merge",
        "class-variance-authority",
        "embla-carousel-react",
        "recharts",
        "openai",
        "axios",
        "jose",
        "cookie",
        "superjson",
      ],
      output: {
        globals: {
          "@stripe/stripe-js": "Stripe",
          "@stripe/react-stripe-js": "Stripe",
          "stripe": "Stripe",
          "driver.js": "driver",
          "react": "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
