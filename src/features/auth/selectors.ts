import type { RootState } from "@/store";
import { getAccessTokenFromCookie } from "@/services/authHelpers";

export function selectIsAuthenticated(state: RootState): boolean {
  return Boolean(state?.auth.accessToken || getAccessTokenFromCookie());
}
