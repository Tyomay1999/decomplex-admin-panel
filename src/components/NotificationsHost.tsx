import * as React from "react";
import { notification } from "antd";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { removeNotice } from "@/features/notifications/notificationsSlice";

export const NotificationsHost: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const queue = useSelector((s: RootState) => s.notifications.queue);

    React.useEffect(() => {
        if (queue.length === 0) return;

        const next = queue[0];

        notification.open({
            type: next.variant,
            message: next.message,
            description: next.description,
            duration: next.duration ?? 4,
            onClose: () => dispatch(removeNotice(next.id)),
        });
    }, [queue, dispatch]);

    return null;
};