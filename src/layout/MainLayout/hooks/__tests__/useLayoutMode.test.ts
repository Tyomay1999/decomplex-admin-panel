import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import type { Grid } from "antd";
import { useLayoutMode } from "../useLayoutMode";

type Breakpoints = { md?: boolean; lg?: boolean };

const useBreakpointMock = vi.fn<[], Breakpoints>();

vi.mock("antd", async () => {
  const actual = await vi.importActual<typeof import("antd")>("antd");
  return {
    ...actual,
    Grid: {
      ...((actual as unknown as { Grid: typeof Grid }).Grid ?? {}),
      useBreakpoint: () => useBreakpointMock(),
    },
  };
});

describe("useLayoutMode", () => {
  it("isMobile=true when md=false", () => {
    useBreakpointMock.mockReturnValue({ md: false, lg: false });
    const { result } = renderHook(() => useLayoutMode());
    expect(result.current.isMobile).toBe(true);
  });

  it("isTablet=true when md=true и lg=false", () => {
    useBreakpointMock.mockReturnValue({ md: true, lg: false });
    const { result } = renderHook(() => useLayoutMode());
    expect(result.current.isTablet).toBe(true);
  });

  it("isTablet=false when lg=true", () => {
    useBreakpointMock.mockReturnValue({ md: true, lg: true });
    const { result } = renderHook(() => useLayoutMode());
    expect(result.current.isTablet).toBe(false);
  });
});
