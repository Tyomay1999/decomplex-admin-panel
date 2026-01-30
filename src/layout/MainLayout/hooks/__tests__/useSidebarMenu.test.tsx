import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSidebarMenu } from "../useSidebarMenu";
import type { MenuItem } from "../../types";
import type { Role } from "@/features/auth/types";

type TFn = (key: string, opts?: { defaultValue?: string }) => string;

const t: TFn = (_k, opts) => opts?.defaultValue ?? _k;

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t, i18n: { resolvedLanguage: "en" } }),
}));

const keys = (items: MenuItem[]): string[] =>
  items
    .filter((i) => typeof (i as MenuItem).key === "string")
    .map((i) => String((i as MenuItem).key));

describe("useSidebarMenu", () => {
  it("always contains vacancies", () => {
    const { result } = renderHook(() => useSidebarMenu({ role: "user" as Role }));
    expect(keys(result.current)).toContain("vacancies");
  });

  it("does not contain users for role=user", () => {
    const { result } = renderHook(() => useSidebarMenu({ role: "user" as Role }));
    expect(keys(result.current)).not.toContain("users");
  });

  it("contains users for role=admin", () => {
    const { result } = renderHook(() => useSidebarMenu({ role: "admin" as Role }));
    expect(keys(result.current)).toContain("users");
  });

  it("contains profile", () => {
    const { result } = renderHook(() => useSidebarMenu({ role: "user" as Role }));
    expect(keys(result.current)).toContain("profile");
  });

  it("contains action:logout", () => {
    const { result } = renderHook(() => useSidebarMenu({ role: "user" as Role }));
    expect(keys(result.current)).toContain("action:logout");
  });
});
