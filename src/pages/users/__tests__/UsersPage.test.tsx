import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const useBreakpoint = vi.fn();

vi.mock("antd", () => ({
  Grid: { useBreakpoint: () => useBreakpoint() },
  Space: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Row: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Col: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const useCreateCompanyUser = vi.fn();

vi.mock("../hooks", () => ({
  useCreateCompanyUser: () => useCreateCompanyUser(),
}));

const createUserCard = vi.fn();
vi.mock("../components/UsersHeader", () => ({
  UsersHeader: () => <div data-testid="users-header" />,
}));

vi.mock("@/pages/users/components", () => ({
  AdminsPlaceholderCard: () => <div data-testid="admins-placeholder" />,
  CreateUserCard: (p: { isLoading: boolean; onSubmit: (v: unknown) => Promise<unknown> }) => {
    createUserCard(p);
    return <div data-testid="create-user-card" data-loading={String(p.isLoading)} />;
  },
}));

import { UsersPage } from "../UsersPage";

describe("UsersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useBreakpoint.mockReturnValue({ md: true });
    useCreateCompanyUser.mockReturnValue({
      isLoading: false,
      submit: vi.fn(async () => ({ ok: true })),
    });
  });

  it("renders the header, creation form, and placeholder", () => {
    render(<UsersPage />);

    expect(screen.getByTestId("users-header")).toBeInTheDocument();
    expect(screen.getByTestId("create-user-card")).toBeInTheDocument();
    expect(screen.getByTestId("admins-placeholder")).toBeInTheDocument();
  });

  it("throws isLoading to CreateUserCard", () => {
    useCreateCompanyUser.mockReturnValue({
      isLoading: true,
      submit: vi.fn(async () => ({ ok: true })),
    });

    render(<UsersPage />);

    expect(screen.getByTestId("create-user-card")).toHaveAttribute("data-loading", "true");
  });

  it("handleSubmit proxies submit and returns its result", async () => {
    const submit = vi.fn(async () => ({ ok: true, message: "ok" }));
    useCreateCompanyUser.mockReturnValue({ isLoading: false, submit });

    render(<UsersPage />);

    const props = createUserCard.mock.calls[0]?.[0];
    expect(props).toBeTruthy();

    const res = await props.onSubmit({
      email: "a@b.com",
      password: "123",
      role: "recruiter",
      position: "",
      language: "en",
    });

    expect(submit).toHaveBeenCalledTimes(1);
    expect(res).toEqual({ ok: true, message: "ok" });
  });
});
