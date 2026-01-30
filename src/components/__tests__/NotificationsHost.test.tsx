import { describe, expect, it, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import type { RootState } from "@/store";

type NoticeVariant = "success" | "info" | "warning" | "error";

type Notice = {
  id: string;
  variant: NoticeVariant;
  message: string;
  description?: string;
  duration?: number;
  dedupeKey?: string;
};

type NotificationOpenArgs = {
  key: string;
  type: NoticeVariant;
  title: string;
  description: string;
  duration: number;
  onClose: () => void;
};

const open = vi.fn<[NotificationOpenArgs], void>();
const dispatch = vi.fn<[unknown], void>();

const useSelectorMock = vi.fn<[(selector: (s: RootState) => unknown) => unknown], unknown>();

vi.mock("react-redux", () => ({
  useDispatch: () => dispatch,
  useSelector: (selector: (s: RootState) => unknown) => useSelectorMock(selector),
}));

const removeNotice = vi.fn<[string], { type: "notifications/removeNotice"; payload: string }>(
  (id) => ({
    type: "notifications/removeNotice",
    payload: id,
  }),
);

vi.mock("@/features/notifications/notificationsSlice", () => ({
  removeNotice: (id: string) => removeNotice(id),
}));

vi.mock("antd", () => ({
  App: {
    useApp: () => ({ notification: { open } }),
  },
}));

import { NotificationsHost } from "../NotificationsHost";

const setQueue = (queue: Notice[]) => {
  const state = { notifications: { queue } } as unknown as RootState;
  useSelectorMock.mockImplementation((selector) => selector(state));
};

describe("NotificationsHost", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does nothing if the queue is empty", () => {
    setQueue([]);
    render(<NotificationsHost />);
    expect(open).toHaveBeenCalledTimes(0);
    expect(dispatch).toHaveBeenCalledTimes(0);
  });

  it("opens the notification and removes the notice from the queue", () => {
    setQueue([
      {
        id: "n1",
        variant: "success",
        message: "Saved",
        description: "Ok",
        duration: 7,
      },
    ]);

    render(<NotificationsHost />);

    expect(open).toHaveBeenCalledTimes(1);

    const args = open.mock.calls[0]?.[0];
    expect(args).toBeTruthy();
    expect(args!.type).toBe("success");
    expect(args!.title).toBe("Saved");
    expect(args!.description).toBe("Ok");
    expect(args!.duration).toBe(7);

    expect(removeNotice).toHaveBeenCalledWith("n1");
    expect(dispatch).toHaveBeenCalledWith({ type: "notifications/removeNotice", payload: "n1" });
  });

  it("substitutes an empty description and duration=4 by default", () => {
    setQueue([
      {
        id: "n2",
        variant: "info",
        message: "Hello",
      },
    ]);

    render(<NotificationsHost />);

    const args = open.mock.calls[0]?.[0];
    expect(args!.description).toBe("");
    expect(args!.duration).toBe(4);
  });

  it("uses dedupeKey if it is set", () => {
    setQueue([
      {
        id: "n3",
        variant: "warning",
        message: "Warn",
        dedupeKey: "  custom-key  ",
      },
    ]);

    render(<NotificationsHost />);

    const args = open.mock.calls[0]?.[0];
    expect(args!.key).toBe("custom-key");
  });

  it("Builds dedupeKey from variant/message/description if dedupeKey does not exist", () => {
    setQueue([
      {
        id: "n4",
        variant: "error",
        message: "  Failed  ",
        description: "  Try again ",
      },
    ]);

    render(<NotificationsHost />);

    const args = open.mock.calls[0]?.[0];
    expect(args!.key).toBe("error::Failed::Try again");
  });
});
