import { describe, it, expect, vi, beforeEach } from "vitest";

type NotifyLevel = "error" | "warning" | "info" | "success";

type AntdNoticeArgs = {
  key: string;
  message: string;
  description?: string;
  duration?: number;
  onClose?: () => void;
};

type NotificationApi = Record<NotifyLevel, (args: AntdNoticeArgs) => void>;

const notificationApi = vi.hoisted<NotificationApi>(() => ({
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
  success: vi.fn(),
}));

vi.mock("antd", () => ({
  notification: notificationApi,
}));

import { notifyOnce } from "@/lib/notify";

const getCall = (level: NotifyLevel, idx: number): AntdNoticeArgs => {
  const fn = notificationApi[level] as unknown as { mock: { calls: unknown[][] } };
  const arg = fn.mock.calls[idx]?.[0] as AntdNoticeArgs | undefined;
  if (!arg) throw new Error("Expected notification call argument");
  return arg;
};

describe("notifyOnce", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls notification[level] with key=message and duration=3", () => {
    notifyOnce("error", "M1", "D1");

    expect(notificationApi.error).toHaveBeenCalledTimes(1);

    const arg = getCall("error", 0);
    expect(arg.key).toBe("M1");
    expect(arg.message).toBe("M1");
    expect(arg.description).toBe("D1");
    expect(arg.duration).toBe(3);
    expect(typeof arg.onClose).toBe("function");
  });

  it("adds (×2) on second call with same message", () => {
    notifyOnce("warning", "M2", "D2");
    notifyOnce("warning", "M2", "D2");

    expect(notificationApi.warning).toHaveBeenCalledTimes(2);

    const first = getCall("warning", 0);
    const second = getCall("warning", 1);

    expect(first.description).toBe("D2");
    expect(second.description).toBe("D2 (×2)");
  });

  it("uses empty description base when description is undefined and count > 1", () => {
    notifyOnce("info", "M3");
    notifyOnce("info", "M3");

    expect(notificationApi.info).toHaveBeenCalledTimes(2);

    const second = getCall("info", 1);
    expect(second.description).toBe(" (×2)");
  });

  it("onClose clears counter so next call starts fresh", () => {
    notifyOnce("success", "M4", "D4");
    notifyOnce("success", "M4", "D4");

    const second = getCall("success", 1);
    expect(second.description).toBe("D4 (×2)");

    second.onClose?.();

    notifyOnce("success", "M4", "D4");

    expect(notificationApi.success).toHaveBeenCalledTimes(3);

    const third = getCall("success", 2);
    expect(third.description).toBe("D4");
  });
});
