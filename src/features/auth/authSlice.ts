import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { clearAccessTokenCookie } from "@/services/authHelpers";
import type { UserDto } from "@/types/auth";

export type AuthStatus = "idle" | "checking" | "authenticated" | "anonymous";

export interface AuthState {
  accessToken: string | null;
  user: UserDto | null;
  status: AuthStatus;
}

interface CredentialsPayload {
  accessToken: string;
  user: UserDto;
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
  status: "idle",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setChecking(state) {
      state.status = "checking";
    },
    setCredentials(state, action: PayloadAction<CredentialsPayload>) {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.status = "authenticated";
    },
    setAnonymous(state) {
      state.accessToken = null;
      state.user = null;
      state.status = "anonymous";
      clearAccessTokenCookie();
    },
    localLogout(state) {
      state.accessToken = null;
      state.user = null;
      state.status = "anonymous";
      clearAccessTokenCookie();
    },
    setUser(state, action: PayloadAction<UserDto | null>) {
      state.user = action.payload;
      state.status = action.payload ? "authenticated" : "anonymous";
    },
  },
});

export const { setUser, setCredentials, localLogout, setChecking, setAnonymous } =
  authSlice.actions;
export default authSlice.reducer;
