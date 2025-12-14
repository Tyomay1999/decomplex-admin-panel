import * as React from "react";
import { Card, Typography, Spin, Alert } from "antd";
import { useCurrentQuery } from "@/services/authApi";

const { Title, Text } = Typography;

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
    return (
      <Alert
        type="error"
        message="Failed to load profile"
        description={<pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(error, null, 2)}</pre>}
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
        <pre style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>{JSON.stringify(data, null, 2)}</pre>
      </Card>
    </div>
  );
};
