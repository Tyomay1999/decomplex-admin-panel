import { notification } from "antd";

type NotifyLevel = "error" | "warning" | "info" | "success";

const activeCounts = new Map<string, number>();

export const notifyOnce = (level: NotifyLevel, message: string, description?: string) => {
  const key = message;

  const count = (activeCounts.get(key) ?? 0) + 1;
  activeCounts.set(key, count);

  notification[level]({
    key,
    message,
    description: count > 1 ? `${description ?? ""} (×${count})` : description,
    duration: 3,
    onClose: () => {
      activeCounts.delete(key);
    },
  });
};
