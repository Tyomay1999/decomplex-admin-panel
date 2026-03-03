import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { UserDto, CurrentSessionDto } from "@/features/auth/types";

type AuthStatus = "idle" | "checking" | "authenticated" | "anonymous";

type RootStateShape = {
  auth: {
    status: AuthStatus;
    user: UserDto | null;
    session: CurrentSessionDto | null;
    accessToken: string | null;
  };
};

type LocationShape = { pathname: string; search: string; hash: string };

type NavigateProps = {
  to: string;
  replace?: boolean;
  state?: unknown;
};

let mockState: RootStateShape = {
  auth: { status: "idle", user: null, session: null, accessToken: null },
};

const mockLocation: LocationShape = { pathname: "/private", search: "", hash: "" };

vi.mock("react-redux", () => ({
  useSelector: (sel: (s: RootStateShape) => unknown) => sel(mockState),
}));

vi.mock("react-router-dom", () => ({
  Navigate: (props: NavigateProps) => (
    <div
      data-testid="navigate"
      data-to={props.to}
      data-replace={String(Boolean(props.replace))}
      data-state={JSON.stringify(props.state ?? null)}
    />
  ),
  useLocation: () => mockLocation,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_k: string, opts?: { defaultValue?: string }) => opts?.defaultValue ?? _k,
  }),
}));

vi.mock("antd", () => ({
  Spin: () => <div data-testid="spin" />,
}));

import { ProtectedRoute } from "@/routes/ProtectedRoute";

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState = { auth: { status: "idle", user: null, session: null, accessToken: null } };
  });

  it("renders loader when status=idle", () => {
    mockState.auth.status = "idle";

    render(
      <ProtectedRoute>
        <div data-testid="child" />
      </ProtectedRoute>,
    );

    expect(screen.getByTestId("spin")).toBeInTheDocument();
    expect(screen.getByText("Loading")).toBeInTheDocument();
    expect(screen.queryByTestId("navigate")).toBeNull();
    expect(screen.queryByTestId("child")).toBeNull();
  });

  it("renders loader when status=checking", () => {
    mockState.auth.status = "checking";

    render(
      <ProtectedRoute>
        <div data-testid="child" />
      </ProtectedRoute>,
    );

    expect(screen.getByTestId("spin")).toBeInTheDocument();
    expect(screen.getByText("Loading")).toBeInTheDocument();
    expect(screen.queryByTestId("navigate")).toBeNull();
  });

  it("redirects to /login when status=anonymous and preserves location in state", () => {
    mockState.auth.status = "anonymous";

    render(
      <ProtectedRoute>
        <div data-testid="child" />
      </ProtectedRoute>,
    );

    const nav = screen.getByTestId("navigate");
    expect(nav.getAttribute("data-to")).toBe("/login");
    expect(nav.getAttribute("data-replace")).toBe("true");

    const state = JSON.parse(nav.getAttribute("data-state") ?? "null") as { from: LocationShape };
    expect(state).toEqual({ from: mockLocation });

    expect(screen.queryByTestId("child")).toBeNull();
  });

  it("renders children when status=authenticated", () => {
    mockState.auth.status = "authenticated";

    render(
      <ProtectedRoute>
        <div data-testid="child" />
      </ProtectedRoute>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.queryByTestId("navigate")).toBeNull();
    expect(screen.queryByTestId("spin")).toBeNull();
  });
});
