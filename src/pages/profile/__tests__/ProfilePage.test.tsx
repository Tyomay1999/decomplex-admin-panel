import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const useBreakpoint = vi.fn();

vi.mock("antd", () => ({
  Grid: { useBreakpoint: () => useBreakpoint() },
  Space: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Typography: {
    Title: ({ children }: { children: React.ReactNode }) => <h4>{children}</h4>,
  },
}));

vi.mock("react-i18next", () => ({
  initReactI18next: { type: "3rdParty", init: () => void 0 },
  useTranslation: () => ({
    t: (_k: string, o?: { defaultValue?: string }) => o?.defaultValue ?? _k,
    i18n: { language: "en", changeLanguage: vi.fn() },
  }),
}));

const useProfileViewModel = vi.fn();

vi.mock("../hooks", () => ({
  useProfileViewModel: () => useProfileViewModel(),
}));

vi.mock("../components", () => ({
  ProfileSkeleton: () => <div data-testid="profile-skeleton" />,
  ProfileHeaderCard: (p: { isMobile: boolean }) => (
    <div data-testid="profile-header" data-mobile={String(p.isMobile)} />
  ),
  ProfileDetailsCard: () => <div data-testid="profile-details" />,
}));

import { ProfilePage } from "../ProfilePage";

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useBreakpoint.mockReturnValue({ md: true });
  });

  it("renders the skeleton when derived.isLoadingLike=true", () => {
    useProfileViewModel.mockReturnValue({
      derived: { isLoadingLike: true, isAuthed: false, hasSession: false },
    });

    render(<ProfilePage />);

    expect(screen.getByTestId("profile-skeleton")).toBeInTheDocument();
  });

  it("renders not available when not authed", () => {
    useProfileViewModel.mockReturnValue({
      derived: { isLoadingLike: false, isAuthed: false, hasSession: true },
    });

    render(<ProfilePage />);

    expect(screen.getByText("Profile is not available.")).toBeInTheDocument();
  });

  it("renders not available when there is no session", () => {
    useProfileViewModel.mockReturnValue({
      derived: { isLoadingLike: false, isAuthed: true, hasSession: false },
    });

    render(<ProfilePage />);

    expect(screen.getByText("Profile is not available.")).toBeInTheDocument();
  });

  it("renders header+details when authed and there is a session", () => {
    useProfileViewModel.mockReturnValue({
      derived: {
        isLoadingLike: false,
        isAuthed: true,
        hasSession: true,
        displayName: "John",
        email: "a@b.com",
        roleLabel: "admin",
        userTypeLabel: "admin",
        companyName: "Acme",
        defaultLocale: "en",
        companyStatus: "active",
        companyId: "c1",
        userId: "u1",
        languageLabel: "en",
        position: "dev",
      },
    });

    render(<ProfilePage />);

    expect(screen.getByTestId("profile-header")).toBeInTheDocument();
    expect(screen.getByTestId("profile-details")).toBeInTheDocument();
  });

  it("passes isMobile=true to ProfileHeaderCard when md=false", () => {
    useBreakpoint.mockReturnValue({ md: false });

    useProfileViewModel.mockReturnValue({
      derived: {
        isLoadingLike: false,
        isAuthed: true,
        hasSession: true,
        displayName: "John",
        email: "a@b.com",
        roleLabel: "admin",
        userTypeLabel: "admin",
        companyName: "Acme",
        defaultLocale: "en",
        companyStatus: "active",
        companyId: "c1",
        userId: "u1",
        languageLabel: "en",
        position: "dev",
      },
    });

    render(<ProfilePage />);

    expect(screen.getByTestId("profile-header")).toHaveAttribute("data-mobile", "true");
  });
});
