import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type NoticeVariant = "success" | "info" | "warning" | "error";

export type Notice = {
    id: string;
    variant: NoticeVariant;
    message: string;
    description?: string;
    duration?: number;
};

type State = {
    queue: Notice[];
};

const initialState: State = {
    queue: [],
};

const slice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        pushNotice(state, action: PayloadAction<Notice>) {
            state.queue.push(action.payload);
        },
        removeNotice(state, action: PayloadAction<string>) {
            state.queue = state.queue.filter((n) => n.id !== action.payload);
        },
        clearNotices(state) {
            state.queue = [];
        },
    },
});

export const { pushNotice, removeNotice, clearNotices } = slice.actions;
export default slice.reducer;
