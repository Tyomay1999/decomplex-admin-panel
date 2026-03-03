import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("react-i18next", () => ({
  initReactI18next: { type: "3rdParty", init: () => void 0 },
  useTranslation: () => ({
    t: (_k: string, o?: { defaultValue?: string }) => o?.defaultValue ?? _k,
    i18n: { language: "en", changeLanguage: vi.fn() },
  }),
}));

const useBreakpoint = vi.fn();
vi.mock("antd", () => ({
  Grid: { useBreakpoint: () => useBreakpoint() },
  Typography: { Title: ({ children }: { children: React.ReactNode }) => <h4>{children}</h4> },
  Space: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Input: (p: {
    value: string;
    placeholder?: string;
    onChange: (e: { target: { value: string } }) => void;
  }) => (
    <input
      aria-label="search"
      value={p.value}
      placeholder={p.placeholder}
      onChange={(e) => p.onChange({ target: { value: (e.target as HTMLInputElement).value } })}
    />
  ),
  Button: (p: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) => (
    <button type="button" onClick={p.onClick} disabled={p.disabled}>
      {p.children}
    </button>
  ),
}));

const navigate = vi.fn<[string, unknown?], void>();
const location = { pathname: "/vacancies", search: "?x=1" };

let params = new URLSearchParams();
const setSearchParams = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigate,
    useLocation: () => location,
    useSearchParams: () => [params, setSearchParams] as const,
  };
});

const useVacanciesList = vi.fn();
vi.mock("../hooks", () => ({
  useVacanciesList: () => useVacanciesList(),
}));

const vacancyFilters = vi.fn();
const vacancyTable = vi.fn();
const vacancyMobileList = vi.fn();

vi.mock("../components/VacancyFilters", () => ({
  VacancyFilters: (p: unknown) => {
    vacancyFilters(p);
    return <div data-testid="filters" />;
  },
}));
vi.mock("../components/VacancyTable", () => ({
  VacancyTable: (p: unknown) => {
    vacancyTable(p);
    return <div data-testid="table" />;
  },
}));
vi.mock("../components/VacancyMobileList", () => ({
  VacancyMobileList: (p: unknown) => {
    vacancyMobileList(p);
    return <div data-testid="mobile-list" />;
  },
}));

import { VacanciesPage } from "../VacanciesPage";

const baseHook = () => ({
  authStatus: "authenticated" as const,
  userCompanyId: "c1",

  q: "",
  status: undefined as "active" | "archived" | undefined,
  jobType: undefined as "full_time" | "part_time" | "remote" | "hybrid" | undefined,

  setQ: vi.fn(),
  setStatus: vi.fn(),
  setJobType: vi.fn(),

  items: [],
  isFetching: false,
  isError: false,
  hasMore: false,

  applyFilters: vi.fn(),
  loadMore: vi.fn(),
});

describe("VacanciesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    params = new URLSearchParams();
    useBreakpoint.mockReturnValue({ md: true });
    useVacanciesList.mockReturnValue(baseHook());
  });

  it("shows Checking session… when idle/checking", () => {
    useVacanciesList.mockReturnValue({
      ...baseHook(),
      authStatus: "checking",
      userCompanyId: "c1",
    });

    render(<VacanciesPage />);
    expect(screen.getByText("Checking session…")).toBeInTheDocument();
  });

  it("shows noCompany if there is no userCompanyId", () => {
    useVacanciesList.mockReturnValue({ ...baseHook(), userCompanyId: null });

    render(<VacanciesPage />);
    expect(screen.getByText("Company is not attached to this user.")).toBeInTheDocument();
  });

  it("desktop: shows search input and VacancyTable", () => {
    render(<VacanciesPage />);

    expect(screen.getByLabelText("search")).toBeInTheDocument();
    expect(screen.getByTestId("table")).toBeInTheDocument();
    expect(screen.queryByTestId("filters")).not.toBeInTheDocument();
  });

  it("mobile: shows VacancyFilters and VacancyMobileList", () => {
    useBreakpoint.mockReturnValue({ md: false });

    render(<VacanciesPage />);

    expect(screen.getByTestId("filters")).toBeInTheDocument();
    expect(screen.getByTestId("mobile-list")).toBeInTheDocument();
    expect(screen.queryByTestId("table")).not.toBeInTheDocument();
  });

  it("The Create vacancy button navigates to /vacancies/new", async () => {
    render(<VacanciesPage />);
    await userEvent.setup().click(screen.getByRole("button", { name: "Create vacancy" }));
    expect(navigate).toHaveBeenCalledWith("/vacancies/new");
  });

  it("goView/goApplications: are passed into the table/list and navigated with state.from", () => {
    const h = baseHook();
    useVacanciesList.mockReturnValue(h);

    render(<VacanciesPage />);

    const p = vacancyTable.mock.calls[0]?.[0] as {
      onView: (id: string) => void;
      onApplications: (id: string) => void;
    };

    p.onView("v1");
    expect(navigate).toHaveBeenCalledWith("/vacancies/v1", { state: { from: "/vacancies?x=1" } });

    p.onApplications("v2");
    expect(navigate).toHaveBeenCalledWith("/vacancies/v2/applications", {
      state: { from: "/vacancies?x=1" },
    });
  });

  it("init from url: reads q/status/jobType and calls setQ/setStatus/setJobType once", () => {
    const h = baseHook();
    useVacanciesList.mockReturnValue(h);

    params = new URLSearchParams("q=react&status=active&jobType=remote");

    const { rerender } = render(<VacanciesPage />);

    expect(h.setQ).toHaveBeenCalledWith("react");
    expect(h.setStatus).toHaveBeenCalledWith("active");
    expect(h.setJobType).toHaveBeenCalledWith("remote");

    rerender(<VacanciesPage />);

    expect(h.setQ).toHaveBeenCalledTimes(1);
    expect(h.setStatus).toHaveBeenCalledTimes(1);
    expect(h.setJobType).toHaveBeenCalledTimes(1);
  });

  it("sync to url: sets/removes q/status/jobType in search params", () => {
    const h = baseHook();
    useVacanciesList.mockReturnValue({ ...h, q: " react ", status: "archived", jobType: "hybrid" });

    params = new URLSearchParams();

    render(<VacanciesPage />);

    const [nextParams, opts] = setSearchParams.mock.calls.at(-1)!;
    const p = nextParams as URLSearchParams;

    expect(p.get("q")).toBe("react");
    expect(p.get("status")).toBe("archived");
    expect(p.get("jobType")).toBe("hybrid");
    expect(opts).toEqual({ replace: true });
  });
});
