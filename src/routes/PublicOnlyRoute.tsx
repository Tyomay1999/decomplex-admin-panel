import React from "react";
import { Navigate } from "react-router-dom";
import { getAccessTokenFromCookie } from "../services/authHelpers";

type Props = {
  children: React.ReactElement;
};

export const PublicOnlyRoute: React.FC<Props> = ({ children }) => {
  const token = getAccessTokenFromCookie();

  if (token) {
    return <Navigate to="/" replace />;
  }

  return children;
};
