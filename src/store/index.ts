import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "@/services/authApi";
import authReducer from "../features/auth/authSlice";
import { vacanciesApi } from "@/features/vacancies/vacanciesApi";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [vacanciesApi.reducerPath]: vacanciesApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, vacanciesApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
