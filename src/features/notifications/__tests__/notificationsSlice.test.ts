import { describe, it, expect } from "vitest";

import reducer, {
  pushNotice,
  removeNotice,
  clearNotices,
} from "@/features/notifications/notificationsSlice";
import type { Notice } from "@/features/notifications/notificationsSlice";

describe("notificationsSlice", () => {
  it("pushNotice → appends notice to queue", () => {
    const prev = { queue: [] as Notice[] };

    const notice: Notice = {
      id: "n1",
      variant: "info",
      message: "Hello",
      description: "Details",
      duration: 3000,
    };

    const next = reducer(prev, pushNotice(notice));

    expect(next.queue).toHaveLength(1);
    expect(next.queue[0]).toEqual(notice);
  });

  it("pushNotice → preserves insertion order", () => {
    const prev = { queue: [] as Notice[] };

    const n1: Notice = { id: "n1", variant: "success", message: "A" };
    const n2: Notice = { id: "n2", variant: "warning", message: "B" };

    const s1 = reducer(prev, pushNotice(n1));
    const s2 = reducer(s1, pushNotice(n2));

    expect(s2.queue.map((n) => n.id)).toEqual(["n1", "n2"]);
  });

  it("removeNotice → removes matching id only", () => {
    const prev = {
      queue: [
        { id: "n1", variant: "info", message: "A" },
        { id: "n2", variant: "error", message: "B" },
        { id: "n3", variant: "success", message: "C" },
      ] as Notice[],
    };

    const next = reducer(prev, removeNotice("n2"));

    expect(next.queue.map((n) => n.id)).toEqual(["n1", "n3"]);
  });

  it("removeNotice → no-op when id not found", () => {
    const prev = {
      queue: [{ id: "n1", variant: "info", message: "A" }] as Notice[],
    };

    const next = reducer(prev, removeNotice("missing"));

    expect(next.queue).toEqual(prev.queue);
  });

  it("clearNotices → empties queue", () => {
    const prev = {
      queue: [
        { id: "n1", variant: "info", message: "A" },
        { id: "n2", variant: "error", message: "B" },
      ] as Notice[],
    };

    const next = reducer(prev, clearNotices());

    expect(next.queue).toEqual([]);
  });
});
