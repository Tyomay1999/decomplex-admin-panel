import { describe, it, expect } from "vitest";
import { store } from "../index";
import { authApi } from "@/services/authApi";
import { vacanciesApi } from "@/services/vacanciesApi";

describe("store", () => {
  it("exposes redux store surface", () => {
    expect(typeof store.dispatch).toBe("function");
    expect(typeof store.getState).toBe("function");
    expect(typeof store.subscribe).toBe("function");
    expect(typeof store.replaceReducer).toBe("function");
  });

  it("initial state contains expected slices", () => {
    const state = store.getState();

    expect(state).toHaveProperty("auth");
    expect(state).toHaveProperty("notifications");
  });

  it("wires RTK Query reducers by reducerPath", () => {
    const state = store.getState() as Record<string, unknown>;

    expect(state).toHaveProperty(authApi.reducerPath);
    expect(state).toHaveProperty(vacanciesApi.reducerPath);

    const authApiState = state[authApi.reducerPath];
    const vacanciesApiState = state[vacanciesApi.reducerPath];

    expect(typeof authApiState).toBe("object");
    expect(authApiState).not.toBeNull();

    expect(typeof vacanciesApiState).toBe("object");
    expect(vacanciesApiState).not.toBeNull();

    expect(authApiState).toHaveProperty("queries");
    expect(authApiState).toHaveProperty("mutations");
    expect(authApiState).toHaveProperty("provided");

    expect(vacanciesApiState).toHaveProperty("queries");
    expect(vacanciesApiState).toHaveProperty("mutations");
    expect(vacanciesApiState).toHaveProperty("provided");
  });
});
