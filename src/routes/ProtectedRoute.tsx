import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { selectIsAuthenticated } from "@/features/auth/selectors";

type Props = { children: React.ReactElement };

export const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const location = useLocation();
  const isAuthed = useSelector((s: RootState) => selectIsAuthenticated(s));

  if (!isAuthed) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
