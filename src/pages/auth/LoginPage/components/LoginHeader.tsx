import { FC } from "react";
import { Typography } from "antd";

const { Title, Text } = Typography;

type Props = {
  title: string;
  description: string;
};

export const LoginHeader: FC<Props> = ({ title, description }) => {
  return (
    <div className="login-header">
      <Title level={3} style={{ marginBottom: 4 }}>
        {title}
      </Title>
      <Text type="secondary">{description}</Text>
    </div>
  );
};
