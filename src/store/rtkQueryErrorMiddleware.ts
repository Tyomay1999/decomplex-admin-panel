import { isRejectedWithValue } from "@reduxjs/toolkit";
import type { Middleware } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { pushNotice } from "@/features/notifications/notificationsSlice";
import type { NoticeVariant } from "@/features/notifications/notificationsSlice";

type ErrorPayload = FetchBaseQueryError | { message: string };

const isFetchBaseQueryError = (e: unknown): e is FetchBaseQueryError => {
    if (!e || typeof e !== "object") return false;
    return "status" in e;
};

const safeString = (v: unknown): string | undefined => {
    return typeof v === "string" && v.trim().length > 0 ? v : undefined;
};

const parseDescription = (data: unknown): string | undefined => {
    if (!data || typeof data !== "object") return undefined;
    const candidate = (data as Record<string, unknown>).message ?? (data as Record<string, unknown>).error;
    return safeString(candidate);
};

const mapHttpStatus = (status: number): { variant: NoticeVariant; message: string } => {
    if (status === 400) return { variant: "warning", message: "Invalid request" };
    if (status === 401) return { variant: "info", message: "Session expired" };
    if (status === 403) return { variant: "warning", message: "Access denied" };
    if (status === 404) return { variant: "warning", message: "Not found" };
    if (status === 429) return { variant: "warning", message: "Too many requests" };
    if (status >= 500) return { variant: "error", message: "Server error" };
    return { variant: "error", message: "Request failed" };
};

export const rtkQueryErrorMiddleware: Middleware = () => (next) => (action: unknown) => {
    if (isRejectedWithValue(action)) {
        const a = action as { payload?: ErrorPayload };
        const payload = a.payload;

        if (payload) {
            if (isFetchBaseQueryError(payload)) {
                if (payload.status === 401) return next(action);

                if (payload.status === "FETCH_ERROR") {
                    const id = crypto.randomUUID();
                    next(action);
                    return next(
                        pushNotice({
                            id,
                            variant: "error",
                            message: "Network error",
                            description: "Please check your internet connection and try again.",
                        }),
                    );
                }

                if (payload.status === "TIMEOUT_ERROR") {
                    const id = crypto.randomUUID();
                    next(action);
                    return next(
                        pushNotice({
                            id,
                            variant: "error",
                            message: "Request timeout",
                            description: "The server took too long to respond. Please try again.",
                        }),
                    );
                }

                if (typeof payload.status === "number") {
                    const mapped = mapHttpStatus(payload.status);
                    const id = crypto.randomUUID();
                    const desc = parseDescription(payload.data);

                    next(action);
                    return next(
                        pushNotice({
                            id,
                            variant: mapped.variant,
                            message: mapped.message,
                            description: desc,
                        }),
                    );
                }
            }

            if (typeof payload === "object" && payload && "message" in payload) {
                const msg = safeString((payload as { message?: unknown }).message) ?? "Unexpected error";
                const id = crypto.randomUUID();
                next(action);
                return next(
                    pushNotice({
                        id,
                        variant: "error",
                        message: msg,
                    }),
                );
            }
        }
    }

    return next(action);
};