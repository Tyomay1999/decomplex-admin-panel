import * as React from "react";
import { Alert, Card, Spin, Typography } from "antd";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useCurrentQuery } from "@/services/authApi";

const { Title, Text } = Typography;

type SerializedError = { name?: string; message?: string; stack?: string; code?: string };
type ApiError = FetchBaseQueryError | SerializedError;

const isFetchBaseQueryError = (e: ApiError): e is FetchBaseQueryError => {
    return typeof e === "object" && e !== null && "status" in e;
};

const safeJson = (v: unknown): string => {
    try {
        return JSON.stringify(v, null, 2);
    } catch {
        return String(v);
    }
};

export const ProfilePage: React.FC = () => {
    const { data, isLoading, isError, error } = useCurrentQuery();

    if (isLoading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
                <Spin />
            </div>
        );
    }

    if (isError) {
        const e = error as ApiError;
        const details = isFetchBaseQueryError(e)
            ? { status: e.status, data: "data" in e ? e.data : undefined }
            : e;

        return (
            <Alert
                type="error"
                message="Failed to load profile"
                description={<pre style={{ whiteSpace: "pre-wrap" }}>{safeJson(details)}</pre>}
            />
        );
    }

    return (
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <Title level={3} style={{ marginTop: 0 }}>
                Profile
            </Title>

            <Card>
                <Text type="secondary">Raw response from /api/auth/current:</Text>
                <pre style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>{safeJson(data)}</pre>
            </Card>
        </div>
    );
};
