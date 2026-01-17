import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig(({ command }) => {
  const repoName = process.env.VITE_REPO_NAME;
  const isServe = command === "serve";

  const base =
    process.env.VITE_BASE_URL ?? (repoName && repoName.trim().length > 0 ? `/${repoName}/` : "/");

  return {
    plugins: [react()],
    base,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    server: isServe
      ? {
          proxy: {
            "/api": {
              target: "http://localhost:4000",
              changeOrigin: true,
              secure: false,
            },
          },
        }
      : undefined,
  };
});
