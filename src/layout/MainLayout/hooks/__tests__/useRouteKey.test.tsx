import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useRouteKey } from "../useRouteKey";

const wrap = (path: string) =>
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>;
  };

describe("useRouteKey", () => {
  it("for / returns dashboard", () => {
    const { result } = renderHook(() => useRouteKey(), { wrapper: wrap("/") });
    expect(result.current).toBe("dashboard");
  });

  it("for /vacancies/123 returns vacancies", () => {
    const { result } = renderHook(() => useRouteKey(), { wrapper: wrap("/vacancies/123") });
    expect(result.current).toBe("vacancies");
  });

  it("for /users returns users", () => {
    const { result } = renderHook(() => useRouteKey(), { wrapper: wrap("/users") });
    expect(result.current).toBe("users");
  });

  it("for an unknown path returns dashboard", () => {
    const { result } = renderHook(() => useRouteKey(), { wrapper: wrap("/unknown") });
    expect(result.current).toBe("dashboard");
  });

  it("ignores query/hash when determining route key", () => {
    const { result } = renderHook(() => useRouteKey(), { wrapper: wrap("/users?x=1#top") });
    expect(result.current).toBe("users");
  });
});
