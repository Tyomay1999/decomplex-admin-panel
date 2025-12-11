import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { getAccessTokenFromCookie } from "../services/authHelpers";

type Props = {
  children: React.ReactElement;
};

export const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const location = useLocation();
  const tokenFromState = useSelector((state: RootState) => state?.auth.accessToken);
  const token = tokenFromState || getAccessTokenFromCookie();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
