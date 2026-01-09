import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "@/services/authApi";
import authReducer from "@/features/auth/authSlice";
import { vacanciesApi } from "@/services/vacanciesApi";
import notificationsReducer from "@/features/notifications/notificationsSlice";
import { rtkQueryErrorMiddleware } from "@/store/rtkQueryErrorMiddleware";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [vacanciesApi.reducerPath]: vacanciesApi.reducer,
    auth: authReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
          rtkQueryErrorMiddleware,
          authApi.middleware,
          vacanciesApi.middleware,
      ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;