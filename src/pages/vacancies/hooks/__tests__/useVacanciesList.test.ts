import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

import type { RootState } from "@/store";

type VacancyDto = { id: string; title?: string };

const useSelector = vi.fn();
vi.mock("react-redux", async () => {
  const actual = await vi.importActual<typeof import("react-redux")>("react-redux");
  return {
    ...actual,
    useSelector: (sel: (s: RootState) => unknown) => useSelector(sel),
  };
});

const useDebouncedValue = vi.fn(<T>(v: T) => v);

vi.mock("../useDebouncedValue", () => ({
  useDebouncedValue: <T>(v: T) => useDebouncedValue(v),
}));

type QueryArgs = {
  companyId: string;
  q?: string;
  status?: string;
  jobType?: string;
  limit: number;
  cursor?: string;
};

type QueryResult = {
  data?: { vacancies: VacancyDto[]; nextCursor: string | null };
  isFetching: boolean;
  isError: boolean;
};

const useGetVacanciesQuery = vi.fn<
  [QueryArgs, { skip: boolean; refetchOnMountOrArgChange: true }],
  QueryResult
>();

vi.mock("@/services/vacanciesApi", () => ({
  useGetVacanciesQuery: (
    args: QueryArgs,
    opts: { skip: boolean; refetchOnMountOrArgChange: true },
  ) => useGetVacanciesQuery(args, opts),
}));

import { useVacanciesList } from "../useVacanciesList";

const setAuthState = (p: {
  status: "idle" | "checking" | "authenticated" | "anonymous";
  companyId?: string;
}) => {
  const state = {
    auth: {
      status: p.status,
      user: { company: { id: p.companyId } },
    },
  } as unknown as RootState;

  useSelector.mockImplementation((sel) => sel(state));
};

describe("useVacanciesList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGetVacanciesQuery.mockReturnValue({
      data: undefined,
      isFetching: false,
      isError: false,
    });
  });

  it("skip=true if not authenticated or no companyId", () => {
    setAuthState({ status: "checking", companyId: "c1" });
    renderHook(() => useVacanciesList());

    const call1 = useGetVacanciesQuery.mock.calls[0];
    expect(call1?.[1].skip).toBe(true);

    vi.clearAllMocks();

    setAuthState({ status: "authenticated", companyId: undefined });
    renderHook(() => useVacanciesList());

    const call2 = useGetVacanciesQuery.mock.calls[0];
    expect(call2?.[1].skip).toBe(true);
  });

  it("Builds queryArgs: trim q, limit=20, cursor undefined if empty/null", () => {
    setAuthState({ status: "authenticated", companyId: "c1" });

    renderHook(() => useVacanciesList());

    const [args, opts] = useGetVacanciesQuery.mock.calls[0]!;
    expect(opts.skip).toBe(false);
    expect(args.companyId).toBe("c1");
    expect(args.limit).toBe(20);
    expect(args.q).toBeUndefined();
    expect(args.cursor).toBeUndefined();
  });

  it("setQ: spaces -> q undefined; non-empty -> q string", () => {
    setAuthState({ status: "authenticated", companyId: "c1" });

    const { result, rerender } = renderHook(() => useVacanciesList());

    act(() => result.current.setQ("   "));
    rerender();

    let [args] = useGetVacanciesQuery.mock.calls.at(-1)!;
    expect(args.q).toBeUndefined();

    act(() => result.current.setQ("  react  "));
    rerender();

    [args] = useGetVacanciesQuery.mock.calls.at(-1)!;
    expect(args.q).toBe("react");
  });

  it("items: when cursor=undefined, replaces items; when cursor is set, appendix", async () => {
    setAuthState({ status: "authenticated", companyId: "c1" });

    const page1: QueryResult = {
      data: { vacancies: [{ id: "v1" }], nextCursor: "c2" },
      isFetching: false,
      isError: false,
    };

    const page2: QueryResult = {
      data: { vacancies: [{ id: "v2" }], nextCursor: "c3" },
      isFetching: false,
      isError: false,
    };

    useGetVacanciesQuery.mockImplementation((args) => {
      if (args.cursor === "c2") return page2;
      return page1;
    });

    const { result } = renderHook(() => useVacanciesList());

    await waitFor(() => {
      expect(result.current.items.map((x) => x.id)).toEqual(["v1"]);
    });

    act(() => result.current.loadMore());

    await waitFor(() => {
      expect(result.current.items.map((x) => x.id)).toEqual(["v1", "v2"]);
    });

    await waitFor(() => {
      const lastArgs = useGetVacanciesQuery.mock.calls.at(-1)?.[0];
      expect(lastArgs?.cursor).toBe("c2");
    });
  });

  it("loadMore: does nothing if isFetching=true or nextCursor is empty", () => {
    setAuthState({ status: "authenticated", companyId: "c1" });

    useGetVacanciesQuery.mockReturnValue({
      data: { vacancies: [], nextCursor: "next" },
      isFetching: true,
      isError: false,
    });

    const { result, rerender } = renderHook(() => useVacanciesList());

    act(() => result.current.loadMore());
    rerender();

    const lastArgs = useGetVacanciesQuery.mock.calls.at(-1)![0];
    expect(lastArgs.cursor).toBeUndefined();

    useGetVacanciesQuery.mockReturnValue({
      data: { vacancies: [], nextCursor: "   " },
      isFetching: false,
      isError: false,
    });

    act(() => result.current.loadMore());
    rerender();

    const lastArgs2 = useGetVacanciesQuery.mock.calls.at(-1)![0];
    expect(lastArgs2.cursor).toBeUndefined();
  });
});
