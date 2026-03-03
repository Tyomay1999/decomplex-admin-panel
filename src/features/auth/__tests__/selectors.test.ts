import { describe, it, expect } from "vitest";
import { selectIsAuthenticated } from "@/features/auth/selectors";
import type { UserDto } from "@/features/auth/types";

type AuthStatus = "idle" | "checking" | "authenticated" | "anonymous";

type RootStateShape = {
  auth: {
    status: AuthStatus;
    user: Pick<UserDto, "id"> | null;
  };
};

describe("auth selectors", () => {
  it("returns false when status is not authenticated", () => {
    const state: RootStateShape = {
      auth: { status: "idle", user: { id: "u1" } },
    };

    expect(selectIsAuthenticated(state)).toBe(false);
  });

  it("returns false when status is authenticated but user.id is missing", () => {
    const state: RootStateShape = {
      auth: { status: "authenticated", user: null },
    };

    expect(selectIsAuthenticated(state)).toBe(false);
  });

  it("returns true when status is authenticated and user.id exists", () => {
    const state: RootStateShape = {
      auth: { status: "authenticated", user: { id: "u1" } },
    };

    expect(selectIsAuthenticated(state)).toBe(true);
  });
});
