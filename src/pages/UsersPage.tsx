import * as React from "react";
import { FC, useState } from "react";
import { Button, Input, Space, Typography, Select } from "antd";
import { useRegisterCompanyUserMutation } from "@/services/authApi";
import type { CompanyUserRole } from "@/services/authApi";

const { Title, Text } = Typography;

export const UsersPage: FC = () => {
  const [registerUser, { isLoading }] = useRegisterCompanyUserMutation();

  const [email, setEmail] = useState("newuser@example.com");
  const [password, setPassword] = useState("123456");
  const [role, setRole] = useState<CompanyUserRole>("recruiter");
  const [position, setPosition] = useState<string>("");
  const [language, setLanguage] = useState<string>("en");

  const [resultText, setResultText] = useState<string>("");

  const onRegister = async () => {
    setResultText("");

    try {
      const data = await registerUser({
        email,
        password,
        role,
        position: position.trim() ? position.trim() : undefined,
        language,
      }).unwrap();

      setResultText(
        `Created: id=${data.id}, email=${data.email}, role=${data.role}, companyId=${data.companyId}`,
      );
    } catch (e) {
      const err = e as { data?: unknown; status?: number };
      setResultText(`Error: ${JSON.stringify(err?.data ?? e)}`);
    }
  };

  return (
    <div>
      <Title level={4} style={{ marginTop: 0 }}>
        Users
      </Title>

      <Space direction="vertical" style={{ width: 420 }}>
        <Input value={email} onChange={(ev) => setEmail(ev.target.value)} placeholder="email" />
        <Input.Password
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          placeholder="password"
        />

        <Select<CompanyUserRole>
          value={role}
          onChange={(v) => setRole(v)}
          options={[
            { value: "admin", label: "admin" },
            { value: "recruiter", label: "recruiter" },
          ]}
        />

        <Input
          value={position}
          onChange={(ev) => setPosition(ev.target.value)}
          placeholder="position (optional)"
        />
        <Input
          value={language}
          onChange={(ev) => setLanguage(ev.target.value)}
          placeholder="language (e.g. en)"
        />

        <Button type="primary" onClick={onRegister} loading={isLoading}>
          Register company user
        </Button>

        {resultText ? <Text>{resultText}</Text> : null}
      </Space>
    </div>
  );
};
