import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const repoName = env.VITE_REPO_NAME;
  const isServe = command === "serve";

  const base =
    env.VITE_BASE_URL ?? (repoName && repoName.trim().length > 0 ? `/${repoName}/` : "/");

  const apiTarget = env.VITE_API_BASE_URL ?? "http://localhost:4000";

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
              target: apiTarget,
              changeOrigin: true,
              secure: false,
            },
          },
        }
      : undefined,
  };
});
