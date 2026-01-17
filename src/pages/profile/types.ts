import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { CurrentSessionDto, UserDto } from "@/features/auth/types";

export type ProfileAuthStatus = "idle" | "checking" | "authenticated" | "anonymous";

export type SerializedError = { name?: string; message?: string; stack?: string; code?: string };
export type ApiError = FetchBaseQueryError | SerializedError;

export type ProfileState = {
  authStatus: ProfileAuthStatus;
  user: UserDto | null;
  session: CurrentSessionDto | null;
};

export type ProfileDerived = {
  isLoadingLike: boolean;
  isAuthed: boolean;
  hasSession: boolean;

  displayName: string;
  email: string;

  role: "admin" | "recruiter" | "company_manager" | "user";
  userType: "admin" | "recruiter" | "company_manager" | "user";

  roleLabel: string;
  userTypeLabel: string;

  companyName: string;
  companyStatus: string;
  defaultLocale: string;
  companyId: string;

  userId: string;
  position: string;

  language: string;
  languageLabel: string;
};
