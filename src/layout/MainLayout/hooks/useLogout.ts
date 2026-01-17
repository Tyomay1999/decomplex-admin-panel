import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store";
import { useLogoutMutation } from "@/services/authApi";
import { localLogout } from "@/features/auth/authSlice";
import { getRefreshTokenFromCookie } from "@/services/authHelpers";

export const useLogout = (): (() => Promise<void>) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [logoutServer] = useLogoutMutation();

  return useCallback(async (): Promise<void> => {
    const refreshToken = getRefreshTokenFromCookie();
    const hasRefresh = typeof refreshToken === "string" && refreshToken.trim().length > 0;

    if (hasRefresh) {
      try {
        await logoutServer({ refreshToken }).unwrap();
      } catch {
        void 0;
      }
    }

    dispatch(localLogout());
    navigate("/login", { replace: true });
  }, [logoutServer, dispatch, navigate]);
};
