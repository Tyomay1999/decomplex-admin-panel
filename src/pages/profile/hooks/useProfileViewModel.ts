import { useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import type { ProfileDerived, ProfileState } from "../types";

const DASH = "—";

const safeDash = (v: string | null | undefined): string => {
  if (typeof v !== "string") return DASH;
  const s = v.trim();
  return s.length > 0 ? s : DASH;
};

type Role = "admin" | "recruiter" | "company_manager" | "user";

const normalizeRole = (v: unknown): Role => {
  if (v === "admin" || v === "recruiter" || v === "company_manager" || v === "user") return v;
  return "user";
};

export const useProfileViewModel = (): {
  state: ProfileState;
  derived: ProfileDerived;
} => {
  const authStatus = useSelector((s: RootState) => s.auth.status);
  const user = useSelector((s: RootState) => s.auth.user);
  const session = useSelector((s: RootState) => s.auth.session);

  const derived = useMemo<ProfileDerived>(() => {
    const isLoadingLike = authStatus === "idle" || authStatus === "checking";
    const isAuthed = authStatus === "authenticated" && Boolean(user?.id);

    const hasSession = Boolean(session);

    const role = normalizeRole(user?.role);
    const userType = normalizeRole(user?.role);

    const languageRaw = safeDash(user?.language);

    return {
      isLoadingLike,
      isAuthed,
      hasSession,

      displayName: safeDash(user?.name),
      email: safeDash(user?.email),

      role: role,
      userType: userType,

      roleLabel: role === DASH ? DASH : role,
      userTypeLabel: userType === DASH ? DASH : userType,

      companyName: safeDash(user?.company?.name),
      companyStatus: safeDash(user?.company?.status),
      defaultLocale: safeDash(user?.company?.defaultLocale),
      companyId: safeDash(user?.company?.id),

      userId: safeDash(user?.id),
      position: safeDash(user?.position),

      language: languageRaw,
      languageLabel: languageRaw,
    };
  }, [authStatus, user, session]);

  return {
    state: {
      authStatus,
      user,
      session,
    },
    derived,
  };
};
