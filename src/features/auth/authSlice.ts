import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { clearAccessTokenCookie, clearRefreshTokenCookie } from "@/services/authHelpers";
import type { CurrentSessionDto, UserDto } from "@/features/auth/types";

export type AuthStatus = "idle" | "checking" | "authenticated" | "anonymous";

export interface AuthState {
  accessToken: string | null;
  user: UserDto | null;
  session: CurrentSessionDto | null;
  status: AuthStatus;
}

type CredentialsPayload = {
  accessToken: string;
  user: UserDto;
  session: CurrentSessionDto | null;
};

const initialState: AuthState = {
  accessToken: null,
  user: null,
  session: null,
  status: "idle",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setChecking(state) {
      state.status = "checking";
    },
    setTokenOnly(state, action: PayloadAction<{ accessToken: string }>) {
      state.accessToken = action.payload.accessToken;
      state.status = "checking";
    },
    setCredentials(state, action: PayloadAction<CredentialsPayload>) {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.session = action.payload.session;
      state.status = "authenticated";
    },
    setAnonymous(state) {
      state.accessToken = null;
      state.user = null;
      state.session = null;
      state.status = "anonymous";
    },
    localLogout(state) {
      state.accessToken = null;
      state.user = null;
      state.session = null;
      state.status = "anonymous";
      clearAccessTokenCookie();
      clearRefreshTokenCookie();
    },
    resetAuthState() {
      return initialState;
    },
  },
});

export const {
  setCredentials,
  setTokenOnly,
  localLogout,
  setChecking,
  setAnonymous,
  resetAuthState,
} = authSlice.actions;

export default authSlice.reducer;
