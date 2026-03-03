import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HeaderBar } from "../HeaderBar";

vi.mock("antd", () => ({
  Avatar: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Button: ({
    onClick,
    "aria-label": ariaLabel,
    icon,
  }: {
    onClick?: () => void;
    "aria-label"?: string;
    icon?: React.ReactNode;
  }) => (
    <button type="button" aria-label={ariaLabel} onClick={onClick}>
      {icon}
    </button>
  ),
  Space: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Typography: {
    Title: ({ children }: { children?: React.ReactNode }) => <h4>{children}</h4>,
  },
}));

vi.mock("@ant-design/icons", () => ({
  MenuFoldOutlined: () => <span>MenuFoldOutlined</span>,
  MenuUnfoldOutlined: () => <span>MenuUnfoldOutlined</span>,
  UserOutlined: () => <span>UserOutlined</span>,
}));

describe("HeaderBar", () => {
  it("calls onToggle when the button is clicked", async () => {
    const onToggle = vi.fn<[], void>();
    const user = userEvent.setup();

    render(
      <HeaderBar
        isMobile={false}
        collapsed={false}
        headerTitle="Title"
        userEmailLabel="user@mail.com"
        onToggle={onToggle}
      />,
    );

    await user.click(screen.getByLabelText("toggle-menu"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("shows email on desktop", () => {
    render(
      <HeaderBar
        isMobile={false}
        collapsed={false}
        headerTitle="Title"
        userEmailLabel="user@mail.com"
        onToggle={() => void 0}
      />,
    );

    expect(screen.getByText("user@mail.com")).toBeInTheDocument();
  });

  it("Email text doesn't show on mobile", () => {
    render(
      <HeaderBar
        isMobile
        collapsed={false}
        headerTitle="Title"
        userEmailLabel="user@mail.com"
        onToggle={() => void 0}
      />,
    );

    expect(screen.queryByText("user@mail.com")).toBeNull();
  });
});
