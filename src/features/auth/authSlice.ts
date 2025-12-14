import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { clearAccessTokenCookie } from "@/services/authHelpers";
import type { UserDto } from "@/services/authHelpers";

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
  },
});

export const { setCredentials, localLogout, setChecking, setAnonymous } = authSlice.actions;
export default authSlice.reducer;
