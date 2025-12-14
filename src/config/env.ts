type AppEnv = "local" | "staging" | "prod";

function requireString(name: keyof ImportMetaEnv): string {
  const v = import.meta.env[name];
  if (!v || typeof v !== "string") throw new Error(`Missing env: ${name}`);
  return v;
}

export const env = {
  API_BASE_URL: requireString("VITE_API_BASE_URL"),
  APP_ENV: requireString("VITE_APP_ENV") as AppEnv,
  API_PREFIX: requireString("VITE_API_PREFIX"),
  DEFAULT_LOCALE: requireString("VITE_DEFAULT_LOCALE"),
} as const;
