import type { RootState } from "@/store";

export const selectIsAuthenticated = (state: RootState): boolean => {
  return state.auth.status === "authenticated" && Boolean(state.auth.user?.id);
};
