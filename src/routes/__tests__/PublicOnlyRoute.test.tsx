import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { UserDto, CurrentSessionDto } from "@/features/auth/types";

type AuthStatus = "idle" | "checking" | "authenticated" | "anonymous";

type RootStateShape = {
  auth: {
    status: AuthStatus;
    user: Pick<UserDto, "id"> | null;
    session: CurrentSessionDto | null;
    accessToken: string | null;
  };
};

type NavigateProps = {
  to: string;
  replace?: boolean;
};

let mockState: RootStateShape = {
  auth: { status: "idle", user: null, session: null, accessToken: null },
};

vi.mock("react-redux", () => ({
  useSelector: (sel: (s: RootStateShape) => unknown) => sel(mockState),
}));

vi.mock("react-router-dom", () => ({
  Navigate: (props: NavigateProps) => (
    <div data-testid="navigate" data-to={props.to} data-replace={String(Boolean(props.replace))} />
  ),
}));

import { PublicOnlyRoute } from "@/routes/PublicOnlyRoute";

describe("PublicOnlyRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState = { auth: { status: "idle", user: null, session: null, accessToken: null } };
  });

  it("redirects to / when user is authenticated", () => {
    mockState.auth.status = "authenticated";
    mockState.auth.user = { id: "u1" };

    render(
      <PublicOnlyRoute>
        <div data-testid="child" />
      </PublicOnlyRoute>,
    );

    const nav = screen.getByTestId("navigate");
    expect(nav.getAttribute("data-to")).toBe("/");
    expect(nav.getAttribute("data-replace")).toBe("true");
    expect(screen.queryByTestId("child")).toBeNull();
  });

  it("renders children when user is not authenticated", () => {
    mockState.auth.status = "anonymous";
    mockState.auth.user = null;

    render(
      <PublicOnlyRoute>
        <div data-testid="child" />
      </PublicOnlyRoute>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.queryByTestId("navigate")).toBeNull();
  });
});
