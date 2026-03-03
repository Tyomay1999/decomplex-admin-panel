export type E2EEnv = {
  baseURL: string;
  apiBaseUrl: string;
  apiPrefix: string;
  resetUrl: string | null;

  admin: { email: string; password: string } | null;
  recruiter: { email: string; password: string } | null;
};

const requireString = (name: string): string => {
  const v = process.env[name];
  if (typeof v !== "string" || v.trim().length === 0) {
    throw new Error(`Missing env: ${name}`);
  }
  return v;
};

const optionalString = (name: string): string | null => {
  const v = process.env[name];
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s.length > 0 ? s : null;
};

const optionalCreds = (
  emailKey: string,
  passKey: string,
): { email: string; password: string } | null => {
  const email = optionalString(emailKey);
  const password = optionalString(passKey);
  if (!email || !password) return null;
  return { email, password };
};

export const e2eEnv: E2EEnv = {
  baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:5173",
  apiBaseUrl: requireString("E2E_API_BASE_URL"),
  apiPrefix: process.env.E2E_API_PREFIX ?? "/api",
  resetUrl: optionalString("E2E_RESET_URL"),

  admin: optionalCreds("E2E_ADMIN_EMAIL", "E2E_ADMIN_PASSWORD"),
  recruiter: optionalCreds("E2E_RECRUITER_EMAIL", "E2E_RECRUITER_PASSWORD"),
};
