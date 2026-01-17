import { FC, useCallback } from "react";
import { Grid, Space, Row, Col } from "antd";
import { UsersHeader } from "./components/UsersHeader";
import { AdminsPlaceholderCard, CreateUserCard } from "@/pages/users/components";
import { useCreateCompanyUser } from "@/pages/users/hooks";
import type { CreateUserFormValues } from "./types";

const { useBreakpoint } = Grid;

export const UsersPage: FC = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const { isLoading, submit } = useCreateCompanyUser();

  const handleSubmit = useCallback(
    async (values: CreateUserFormValues) => {
      return await submit(values);
    },
    [submit],
  );

  return (
    <div className="usersPage">
      <Space orientation="vertical" size={12} style={{ width: "100%" }}>
        <UsersHeader />

        <Row gutter={[isMobile ? 12 : 16, isMobile ? 12 : 16]} align="top">
          <Col xs={24} lg={9} xl={8}>
            <Space orientation="vertical" size={12} style={{ width: "100%" }}>
              <CreateUserCard isLoading={isLoading} onSubmit={handleSubmit} />
            </Space>
          </Col>

          <Col xs={24} lg={15} xl={16}>
            <AdminsPlaceholderCard />
          </Col>
        </Row>
      </Space>
    </div>
  );
};
