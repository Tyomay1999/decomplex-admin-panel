import { FC, useEffect, useRef } from "react";
import { App as AntdApp } from "antd";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { removeNotice } from "@/features/notifications/notificationsSlice";

type NoticeVariant = "success" | "info" | "warning" | "error";

type Notice = {
  id: string;
  variant: NoticeVariant;
  message: string;
  description?: string;
  duration?: number;
  dedupeKey?: string;
};

const buildDedupeKey = (n: Notice): string => {
  const msg = (n.message ?? "").trim();
  const desc = (n.description ?? "").trim();
  const variant = (n.variant ?? "info").trim();
  return `${variant}::${msg}::${desc}`;
};

export const NotificationsHost: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const queue = useSelector((s: RootState) => s.notifications.queue) as Notice[];

  const countsRef = useRef<Map<string, number>>(new Map());
  const activeKeysRef = useRef<Set<string>>(new Set());

  const { notification } = AntdApp.useApp();

  useEffect(() => {
    if (queue.length === 0) return;

    const next = queue[0];
    const key = next.dedupeKey?.trim() || buildDedupeKey(next);

    const prevCount = countsRef.current.get(key) ?? 0;
    const count = prevCount + 1;
    countsRef.current.set(key, count);

    const isAlreadyShown = activeKeysRef.current.has(key);

    const baseMessage = next.message;
    const baseDescription = next.description;

    const description = baseDescription ?? "";

    notification.open({
      key,
      type: next.variant,
      title: baseMessage,
      description,
      duration: next.duration ?? 4,
      onClose: () => {
        activeKeysRef.current.delete(key);
        countsRef.current.delete(key);
      },
    });

    if (!isAlreadyShown) {
      activeKeysRef.current.add(key);
    }

    dispatch(removeNotice(next.id));
  }, [queue, dispatch, notification]);

  return null;
};
