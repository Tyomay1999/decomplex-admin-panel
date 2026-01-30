import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AnyAction, Dispatch, MiddlewareAPI } from "@reduxjs/toolkit";

const pushNoticeMock = vi.fn((payload: unknown) => ({
  type: "notifications/pushNotice",
  payload,
}));

vi.mock("@/features/notifications/notificationsSlice", () => ({
  pushNotice: (payload: unknown) => pushNoticeMock(payload),
}));

import { rtkQueryErrorMiddleware } from "@/store/rtkQueryErrorMiddleware";

type Next = (action: unknown) => unknown;

const createApi = (): MiddlewareAPI<Dispatch, unknown> => {
  const dispatch: Dispatch = vi.fn();
  const getState = vi.fn(() => ({}));
  return { dispatch, getState };
};

const createNext = (): ReturnType<typeof vi.fn<Next>> => vi.fn<Next>((a) => a);

const rejectedAction = (payload: unknown): AnyAction => ({
  type: "authApi/executeMutation/rejected",
  meta: {
    arg: { endpointName: "login", type: "mutation" },
    requestId: "test",
    rejectedWithValue: true,
    requestStatus: "rejected" as const,
  },
  payload,
});

const getNoticeArg = ():
  | { id?: unknown; variant?: unknown; message?: unknown; description?: unknown }
  | undefined =>
  pushNoticeMock.mock.calls[0]?.[0] as
    | { id?: unknown; variant?: unknown; message?: unknown; description?: unknown }
    | undefined;

describe("rtkQueryErrorMiddleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const c = globalThis.crypto as Crypto | undefined;
    if (!c || typeof c.randomUUID !== "function") {
      Object.defineProperty(globalThis, "crypto", {
        value: { randomUUID: vi.fn(() => "test-uuid") },
        configurable: true,
      });
      return;
    }

    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue("test-uuid");
  });

  it("passes through non-rejected actions", () => {
    const api = createApi();
    const next = createNext();
    const handle = rtkQueryErrorMiddleware(api)(next);

    const action: AnyAction = { type: "test/any" };
    handle(action);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(action);
    expect(pushNoticeMock).not.toHaveBeenCalled();
  });

  it("skips notice for 401 rejected fetchBaseQuery errors", () => {
    const api = createApi();
    const next = createNext();
    const handle = rtkQueryErrorMiddleware(api)(next);

    const action = rejectedAction({ status: 401, data: {} });
    handle(action);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(action);
    expect(pushNoticeMock).not.toHaveBeenCalled();
  });

  it("creates notice payload for FETCH_ERROR", () => {
    const api = createApi();
    const next = createNext();
    const handle = rtkQueryErrorMiddleware(api)(next);

    const action = rejectedAction({ status: "FETCH_ERROR", error: "Failed to fetch" });
    handle(action);

    expect(pushNoticeMock).toHaveBeenCalledTimes(1);

    const arg = getNoticeArg();
    expect(arg?.id).toBe("test-uuid");
    expect(arg?.variant).toBe("error");
    expect(arg?.message).toBe("Network error");
    expect(arg?.description).toBe("Please check your internet connection and try again.");

    expect(next).toHaveBeenCalledTimes(2);
  });

  it("creates notice payload for TIMEOUT_ERROR", () => {
    const api = createApi();
    const next = createNext();
    const handle = rtkQueryErrorMiddleware(api)(next);

    const action = rejectedAction({ status: "TIMEOUT_ERROR", error: "Timeout" });
    handle(action);

    expect(pushNoticeMock).toHaveBeenCalledTimes(1);

    const arg = getNoticeArg();
    expect(arg?.id).toBe("test-uuid");
    expect(arg?.variant).toBe("error");
    expect(arg?.message).toBeTruthy();
    expect(arg?.description).toBeTruthy();

    expect(next).toHaveBeenCalledTimes(2);
  });

  it("creates notice payload for 400 with parsed message/description", () => {
    const api = createApi();
    const next = createNext();
    const handle = rtkQueryErrorMiddleware(api)(next);

    const action = rejectedAction({
      status: 400,
      data: { message: "Bad request", description: "Invalid payload" },
    });

    handle(action);

    expect(pushNoticeMock).toHaveBeenCalledTimes(1);

    const arg = getNoticeArg();
    expect(arg?.id).toBe("test-uuid");
    expect(arg?.variant).toBe("warning");
    expect(arg?.message).toBeTruthy();
    expect(arg?.description).toBeTruthy();

    expect(next).toHaveBeenCalledTimes(2);
  });

  it("creates notice payload for 403", () => {
    const api = createApi();
    const next = createNext();
    const handle = rtkQueryErrorMiddleware(api)(next);

    const action = rejectedAction({ status: 403, data: { message: "Forbidden" } });
    handle(action);

    expect(pushNoticeMock).toHaveBeenCalledTimes(1);

    const arg = getNoticeArg();
    expect(arg?.variant).toBe("warning");
    expect(arg?.message).toBeTruthy();

    expect(next).toHaveBeenCalledTimes(2);
  });

  it("creates notice payload for 404", () => {
    const api = createApi();
    const next = createNext();
    const handle = rtkQueryErrorMiddleware(api)(next);

    const action = rejectedAction({ status: 404, data: { message: "Not found" } });
    handle(action);

    expect(pushNoticeMock).toHaveBeenCalledTimes(1);

    const arg = getNoticeArg();
    expect(arg?.variant).toBe("warning");
    expect(arg?.message).toBeTruthy();

    expect(next).toHaveBeenCalledTimes(2);
  });

  it("creates notice payload for 429", () => {
    const api = createApi();
    const next = createNext();
    const handle = rtkQueryErrorMiddleware(api)(next);

    const action = rejectedAction({ status: 429, data: { message: "Too many requests" } });
    handle(action);

    expect(pushNoticeMock).toHaveBeenCalledTimes(1);

    const arg = getNoticeArg();
    expect(arg?.variant).toBe("warning");
    expect(arg?.message).toBeTruthy();

    expect(next).toHaveBeenCalledTimes(2);
  });

  it("creates notice payload for 500", () => {
    const api = createApi();
    const next = createNext();
    const handle = rtkQueryErrorMiddleware(api)(next);

    const action = rejectedAction({ status: 500, data: { message: "Server error" } });
    handle(action);

    expect(pushNoticeMock).toHaveBeenCalledTimes(1);

    const arg = getNoticeArg();
    expect(arg?.variant).toBe("error");
    expect(arg?.message).toBeTruthy();

    expect(next).toHaveBeenCalledTimes(2);
  });
});
