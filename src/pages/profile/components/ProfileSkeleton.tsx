import { FC } from "react";
import { Spin } from "antd";

export const ProfileSkeleton: FC = () => {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
      <Spin />
    </div>
  );
};
