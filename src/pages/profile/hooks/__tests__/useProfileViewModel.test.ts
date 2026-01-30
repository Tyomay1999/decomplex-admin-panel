import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import type { RootState } from "@/store";

const useSelector = vi.fn();

vi.mock("react-redux", async () => {
  const actual = await vi.importActual<typeof import("react-redux")>("react-redux");
  return {
    ...actual,
    useSelector: (selector: (s: RootState) => unknown) => useSelector(selector),
  };
});

import { useProfileViewModel } from "../useProfileViewModel";

type Role = "admin" | "recruiter" | "company_manager" | "user";

type AuthState = {
  status: "idle" | "checking" | "authenticated" | "unauthenticated";
  user: null | {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    role?: unknown;
    language?: string | null;
    position?: string | null;
    company?: null | {
      id?: string | null;
      name?: string | null;
      status?: string | null;
      defaultLocale?: string | null;
    };
  };
  session: unknown | null;
};

const makeState = (auth: AuthState): RootState => ({ auth }) as unknown as RootState;

describe("useProfileViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("state: returns the original values from auth", () => {
    const auth: AuthState = { status: "checking", user: null, session: null };
    const state = makeState(auth);

    useSelector.mockImplementation((selector: (s: RootState) => unknown) => selector(state));

    const { result } = renderHook(() => useProfileViewModel());

    expect(result.current.state.authStatus).toBe("checking");
    expect(result.current.state.user).toBeNull();
    expect(result.current.state.session).toBeNull();
  });

  it("derived: isLoadingLike=true when status=idle", () => {
    const state = makeState({ status: "idle", user: null, session: null });
    useSelector.mockImplementation((selector: (s: RootState) => unknown) => selector(state));

    const { result } = renderHook(() => useProfileViewModel());

    expect(result.current.derived.isLoadingLike).toBe(true);
  });

  it("derived: isLoadingLike=true with status=checking", () => {
    const state = makeState({ status: "checking", user: null, session: null });
    useSelector.mockImplementation((selector: (s: RootState) => unknown) => selector(state));

    const { result } = renderHook(() => useProfileViewModel());

    expect(result.current.derived.isLoadingLike).toBe(true);
  });

  it("derived: isAuthed=true only if authenticated and has user.id", () => {
    const state = makeState({
      status: "authenticated",
      user: { id: "u1" },
      session: null,
    });
    useSelector.mockImplementation((selector: (s: RootState) => unknown) => selector(state));

    const { result } = renderHook(() => useProfileViewModel());

    expect(result.current.derived.isAuthed).toBe(true);
  });

  it("derived: isAuthed=false if authenticated but user.id is missing", () => {
    const state = makeState({
      status: "authenticated",
      user: { id: "" },
      session: null,
    });
    useSelector.mockImplementation((selector: (s: RootState) => unknown) => selector(state));

    const { result } = renderHook(() => useProfileViewModel());

    expect(result.current.derived.isAuthed).toBe(false);
  });

  it("derived: hasSession=true if session truthy", () => {
    const state = makeState({
      status: "authenticated",
      user: { id: "u1" },
      session: { a: 1 },
    });
    useSelector.mockImplementation((selector: (s: RootState) => unknown) => selector(state));

    const { result } = renderHook(() => useProfileViewModel());

    expect(result.current.derived.hasSession).toBe(true);
  });

  it("derived: normalizeRole casts unknown value to user", () => {
    const state = makeState({
      status: "authenticated",
      user: { id: "u1", role: "super_admin" },
      session: {},
    });
    useSelector.mockImplementation((selector: (s: RootState) => unknown) => selector(state));

    const { result } = renderHook(() => useProfileViewModel());

    expect(result.current.derived.role).toBe("user" satisfies Role);
  });

  it("derived: safeDash returns '—' for empty/undefined values", () => {
    const state = makeState({
      status: "authenticated",
      user: {
        id: "u1",
        name: "   ",
        email: undefined,
        language: null,
        company: { name: "" },
        position: "   ",
      },
      session: {},
    });
    useSelector.mockImplementation((selector: (s: RootState) => unknown) => selector(state));

    const { result } = renderHook(() => useProfileViewModel());

    expect(result.current.derived.displayName).toBe("—");
    expect(result.current.derived.email).toBe("—");
    expect(result.current.derived.languageLabel).toBe("—");
    expect(result.current.derived.companyName).toBe("—");
    expect(result.current.derived.position).toBe("—");
  });
});
