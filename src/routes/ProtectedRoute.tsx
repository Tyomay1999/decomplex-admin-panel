import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

type Props = { children: React.ReactElement };

export const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const location = useLocation();
  const status = useSelector((s: RootState) => s.auth.status);

  if (status === "idle" || status === "checking") {
    return <div style={{ padding: 24 }}>Checking session…</div>;
  }

  if (status === "anonymous") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
