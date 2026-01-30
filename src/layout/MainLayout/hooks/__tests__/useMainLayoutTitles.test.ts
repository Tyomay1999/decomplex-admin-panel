import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useMainLayoutTitles } from "../useMainLayoutTitles";

type TFn = (key: string, opts?: { defaultValue?: string }) => string;

const t: TFn = (_k, opts) => opts?.defaultValue ?? _k;

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t }),
}));

describe("useMainLayoutTitles", () => {
  it("SidebarTitle is short when collapsed=true", () => {
    const { result } = renderHook(() => useMainLayoutTitles({ collapsed: true, isMobile: false }));
    expect(result.current.sidebarTitle).toBe("D");
  });

  it("SidebarTitle is full when collapsed=false", () => {
    const { result } = renderHook(() => useMainLayoutTitles({ collapsed: false, isMobile: false }));
    expect(result.current.sidebarTitle).toBe("Decomplex Admin");
  });

  it("headerTitle on mobile uses brandFull", () => {
    const { result } = renderHook(() => useMainLayoutTitles({ collapsed: false, isMobile: true }));
    expect(result.current.headerTitle).toBe("Decomplex");
  });

  it("headerTitle on desktop uses title", () => {
    const { result } = renderHook(() => useMainLayoutTitles({ collapsed: false, isMobile: false }));
    expect(result.current.headerTitle).toBe("Decomplex Admin Panel");
  });
});
