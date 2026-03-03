import type { AnyAction, Dispatch, MiddlewareAPI } from "@reduxjs/toolkit";
import { vi } from "vitest";

export type Next = (action: unknown) => unknown;

export const createMiddlewareApi = (): MiddlewareAPI<Dispatch, unknown> => {
  const dispatch: Dispatch = vi.fn();
  const getState = vi.fn(() => ({}));
  return { dispatch, getState };
};

export const createNext = (): ReturnType<typeof vi.fn<Next>> => vi.fn<Next>((a) => a);

export const createRejectedWithValueAction = (payload: unknown): AnyAction => ({
  type: "api/test/rejected",
  meta: { rejectedWithValue: true, requestStatus: "rejected" as const },
  payload,
});
