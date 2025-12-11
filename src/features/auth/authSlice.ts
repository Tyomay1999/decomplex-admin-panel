import { createSlice } from "@reduxjs/toolkit";
import type { UserDto } from "../../services/authHelpers";
import { clearAuthCookies } from "../../services/authHelpers";

export interface AuthState {
  accessToken: string | null;
  user: UserDto | null;
}

interface CredentialsPayload {
  accessToken: string;
  user: UserDto;
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action: { payload: CredentialsPayload }) {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
    },
    logout(state) {
      state.accessToken = null;
      state.user = null;
      clearAuthCookies();
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
