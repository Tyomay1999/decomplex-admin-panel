import { FC, ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Spin } from "antd";
import { useTranslation } from "react-i18next";
import type { RootState } from "@/store";

type Props = { children: ReactElement };

export const ProtectedRoute: FC<Props> = ({ children }) => {
  const { t } = useTranslation("common");
  const location = useLocation();
  const status = useSelector((s: RootState) => s.auth.status);

  if (status === "idle" || status === "checking") {
    return (
      <div className="route-loader">
        <div className="route-loaderCard">
          <Spin size="large" />
          <div className="route-loaderText">{t("common.loading", { defaultValue: "Loading" })}</div>
        </div>
      </div>
    );
  }

  if (status === "anonymous") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
