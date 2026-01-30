import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("antd", () => ({
  Space: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Typography: {
    Title: ({ children }: { children: React.ReactNode }) => <h4>{children}</h4>,
    Text: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  },
}));

vi.mock("react-i18next", () => ({
  initReactI18next: { type: "3rdParty", init: () => void 0 },
  useTranslation: () => ({
    t: (_k: string, o?: { defaultValue?: string }) => o?.defaultValue ?? _k,
    i18n: { language: "en", changeLanguage: vi.fn() },
  }),
}));

import { UsersHeader } from "../UsersHeader";

describe("UsersHeader", () => {
  it("renders the title and subtitle", () => {
    render(<UsersHeader />);

    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Create admin/recruiter users. Listing will be added after backend support.",
      ),
    ).toBeInTheDocument();
  });
});
